import { openai } from "./client"
import { config } from "../config"
import { Incident } from "../models/incident";
import { Patch, PatchApplicationResult } from "../models/patch";
import { patchApplicationSchema } from "../schema/patchApplicationSchema";
import { validatePatchApplication } from "../validations/validatePatchResult";

export async function patchApplier(incident:Incident,patch:Patch): Promise<PatchApplicationResult> {
    if (!patch.canPatch){ 
        throw new Error( "Cannot apply Patch" ); 
    }
    if (patch.files.length === 0){ 
        throw new Error( "Patch does not contain any files." ); 
    }
    const approvedFiles = patch.files.map(file => ({
        path: file.path,
        diff: file.diff,
        originalContent:file.originalContent
    }));
    const remediationBranch = `ai-fix/${incident.id}`;
    const response = await openai.responses.create({
        model: config.openaiModel,
        instructions:`
            You are the GitHub remediation execution agent for an self-healing CI/CD system. 
            
            Your responsibility is to apply an ALREADY APPROVED remediation patch to a GitHub repository. 
            
            You are NOT responsible for deciding what should be fixed. The diagnosis and patch have already been produced and approved by another part of the system. 
            
            Your job is ONLY to execute the approved repository change safely.

            Repository:${config.githubOwner}/${config.githubRepo}

            Incident:
            Id:${incident.workflowRunId}
            Failed wrokflow:${incident.workflowName}
            Failed workflow run:${incident.workflowRunId}
            Failed branch:${incident.branch}
            Failed commit:${incident.commitSha}

            Remidiation branch:
            Create or use this branch:${remediationBranch}
            Branch must be based on the failed commit:${incident.commitSha}
            Do not base the remediation branch on a newer unrelated commit.

            Approved patch:
            The following files are approved for modification:

            ${approvedFiles.map(file => `FILE:${file.path} APPROVED DIFF:${file.diff} ORIGINAL CONTENT:${file.originalContent}`).join("\n--------------\n")}

            Strict rules:
            ** Apply ONLY the approved patch. **
            ** Do NOT invent additional changes. **
            ** Do NOT refactor unrelated code. **
            ** Do NOT improve formatting unless it is explicitly part of the approved patch. **
            ** Do NOT modify files that are not listed above. **
            ** Do NOT modify: .github.workflows/* OR package.json OR package-lock.json. **
            ** Do NOT disable tests. **
            ** Do NOT remove tests. **
            ** Do NOT weaken tests. **
            ** Do NOT delete files. ** 
            ** Do NOT create new files unless the approved patch explicitly contains them. **
            ** Do NOT merge the branch. **
            ** Do NOT create a pull request. **
            ** Do NOT modify the main branch. **
            ** Do NOT push changes directly to the failed branch. **
            ** Only modify the remediation branch: ${remediationBranch} **

            Guthub MCP operations:
            Use GitHub MCP for repository operations.

            The intended sequence is:
            1. Create the remediation branch from:${incident.commitSha}
            2. Apply ONLY approved file changes.
            3. Commit changes to:${remediationBranch}
            4. Use this commit message: "ai: remediate CI failure ${incident.id}"
            5. Do not perfrom any merge operation.
            6. Do not create a pull request.

            Patch interpretation:
            The diff provided to you represents the approved change.

            Do not reinterpret the intent.

            Do not generate an alternative solution.
            
            Do not make the patch larger.
            
            If the approved patch cannot safely be applied, DO NOT guess.
            
            Return: success = false and explain exactly why the patch could not be applied.

            Final verification:
            After applying the patch, verify:

            1. The branch exists.
            2. The branch is based on the failed commit.
            3. Only approved files were modified.
            4. No protected files were modified.
            5. The commit was created on the remediation branch.
            6. The main branch was not modified.
            
            Return a structured result describing what happened.
        `,
        tools:[
            {
                type: "mcp",
                server_label: "github",
                server_url: config.githubMcpServerUrl,
                headers: {
                    "X-MCP-Toolsets": "repos",
                    "X-MCP-Readonly": "false"
                },
                authorization: config.githubPat,
                require_approval: 'never',
            }
        ],
        text:{
            format: {
                type: "json_schema",
                name: "ci_patch_applier",
                strict: true,
                schema: patchApplicationSchema
            }
        },
        input: `
            Apply the approved remediation patch now. 
            
            Incident: ${incident.id} 
            Remediation branch: ${remediationBranch} 
            Failed commit: ${incident.commitSha}
            Approved files: ${patch.files .map( (file) => file.path ) .join(", ")}
            Do not make any changes outside the approved patch.
        `   
    });

    const output = response.output_text;

    if(!output){
        throw new Error("Empty patch result returned")
    }

    const result = JSON.parse(output) as unknown;
    validatePatchApplication(result)

    if(!result.success){ 
        throw new Error(`Patch application failed: ${result.message}`);
    } 
    if (result.branch !==remediationBranch){
        throw new Error(`Agent returned unexpected branch: ${result.branch}`);
    }
    const approvedPaths =new Set(patch.files.map((file) => file.path));

    for (const modifiedFile of result.modifiedFiles){
        if (!approvedPaths.has(modifiedFile)){
            throw new Error(`Agent modified an unapproved file: ${modifiedFile}`);
        }
    }
    
    return result;
}