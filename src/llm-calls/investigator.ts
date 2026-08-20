import { openai } from "./client"
import { config } from "../config"
import { diagnosisSchema } from "../schema/diagnosisSchema";
import { Diagnosis } from "../models/diagnosis";
import { validateDiagnosis } from "../validations/validateDiagnosis";
import { IncidentContext } from "../models/incident";

export async function investigate(context:IncidentContext): Promise<Diagnosis> {
    const response = await openai.responses.create({
        model: config.openaiModel,
        instructions:`
            You are an site reliability engineer CI/CD failures.

            You have read-only access to Guthub through the Github MCP server.

            Investigate GitHub Actions workflow run:

            Repository:${config.githubOwner}/${config.githubRepo}

            Workflow Run ID:${context.workflowRunId}

            Branch:${context.branch}

            commit:${context.commitSha}

            Your responsibilities: 
            1. Identify the failed job. 
            2. Identify the failed step. 
            3. Inspect the relevant logs. 
            4. Inspect relevant repository files if needed. 
            5. Determine the most likely root cause. 
            6. Determine whether the failure is safely fixable. 
            7. Classify the failure. 
            8. Estimate confidence from 0 to 1. 
            9. Assign a risk level.

            Important rules: 
            ** - Do not modify the repository. ** 
            ** - Do not create branches. ** 
            ** - Do not create pull requests. **
            ** - Do not merge anything. **
            ** - Do not invent information that is not supported by the logs or repository. **
            ** - If the root cause is uncertain, lower confidence. **
            ** - Do not classify something as LOW risk simply because you think it is easy. **
        `,
        tools:[
            {
                type: "mcp",
                server_label: "github",
                server_url: config.githubMcpServerUrl,
                headers: {
                    "X-MCP-Toolsets": "actions",
                    "X-MCP-Readonly": "true"
                },
                authorization: config.githubPat,
                require_approval: 'never',
            }
        ],
        text:{
            format: {
                type: "json_schema",
                name: "ci_failure_diagnosis",
                strict: true,
                schema: diagnosisSchema
            }
        },
        input: `
            Investigate the latest failed Github Actions workflows for:
            for ${config.githubOwner}/${config.githubRepo}.

            Return a structured diagnosis.
        `   
    });

    const rawOutput = response.output_text;

    if(!rawOutput){
        throw new Error("Empty diagnosis returned")
    }
    
    const diagnosis = JSON.parse(rawOutput) as unknown;
    validateDiagnosis(diagnosis);
    return diagnosis;
}