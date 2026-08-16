import { openai } from "./client"
import { config } from "../config"
import { diagnosisSchema } from "../schema/diagnosisSchema";
import { Diagnosis } from "../models/diagnosis";
import { validateDiagnosis } from "../validations/validateDiagnosis";

export async function investigate(): Promise<Diagnosis> {
    const response = await openai.responses.create({
        model: config.openaiModel,
        instructions:`
            You are an site reliability engineer CI/CD failures.

            You have read-only access to Guthub through the Github MCP server.

            Repository:${config.githubOwner}/${config.githubRepo}

            Your responsibilities: 
            1. Find the latest failed GitHub Actions workflow. 
            2. Identify the failed job. 
            3. Identify the failed step. 
            4. Inspect the relevant logs. 
            5. Inspect relevant repository files if needed. 
            6. Determine the most likely root cause. 
            7. Determine whether the failure is safely fixable. 
            8. Classify the failure. 
            9. Estimate confidence from 0 to 1. 
            10. Assign a risk level.

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
    
    const diagnosis = JSON.parse(rawOutput) as any;
    validateDiagnosis(diagnosis);
    return diagnosis;
}