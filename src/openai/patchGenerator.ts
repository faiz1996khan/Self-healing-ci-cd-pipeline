import { openai } from "./client";
import { config } from "../config";
import { Diagnosis } from "../models/diagnosis";
import { Patch } from "../models/patch";
import { patchSchema } from "../schema/patchSchema";
import { validatePath } from "../validations/validatePatch";

export async function generatePatch(diagnosis:Diagnosis): Promise<Patch> {
    const response = await openai.responses.create({
        model: config.openaiModel,
        instructions: `
            You are an site reliability engineer responsible for generating minimal code remediation patches.

            You have read-only access to Guthub through the Github MCP server.
            
            Repository:${config.githubOwner}/${config.githubRepo}

            Your job is to:
            1. Understand the CI failure.
            2. Review the diagnosis.
            3. Inspect only the relevant repository files.
            4. Generate the smallest safe patch.
            5. Return unified diffs.

            Strict rules:
            ** - Do not modify secrets. **
            ** - Do not modify .env files. ** 
            ** - Do not modify credentials. **
            ** - Do not modify CI workflows. **
            ** - Do not weaken tests. **
            ** - Do not remove tests. **
            ** - Do not disable linting. **
            ** - Do not disable type checking. **
            ** - Do not modify unrelated files. **
            ** - Do not perform broad refactoring. **
            ** - Prefer the smallest possible change. **
            ** - If a safe patch cannot be generated, set canPatch to false. **
            ** - Do not invent file contents. **
        `,
        tools:[
            {
                type: "mcp",
                server_label: "github",
                server_url: config.githubMcpServerUrl,
                headers: {
                    "X-MCP-Toolsets": "repos,pull_requests",
                    "X-MCP-Readonly": "true"
                },
                authorization: config.githubPat,
                require_approval: 'never',
            }
        ],
        text: {
            format: {
                type: "json_schema",
                name: "ci_patch",
                strict: true,
                schema: patchSchema
            }
        },
        input: `
            Generate a remediation patch for this diagnosis:

            Category: ${diagnosis.category} 
            Confidence: ${diagnosis.confidence} 
            Risk: ${diagnosis.risk} 
            Root cause: ${diagnosis.rootCause} 
            Affected files: ${diagnosis.affectedFiles.join(", ")} 
            Recommended action: ${diagnosis.recommendedAction}

            Read the relevant source files using Github MCP.

            Return only the structured patch responses.
        `
    });

    const rawOutput = response.output_text;

    if(!rawOutput){
        throw new Error("Empty patch returned");
    }

    const patch = JSON.parse(rawOutput) as unknown;
    validatePath(patch);
    return patch;
}