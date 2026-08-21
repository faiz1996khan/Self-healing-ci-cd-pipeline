import { openai } from "./client";
import { Incident } from "../models/incident";
import { PullRequestResult } from "../models/pullRequest";
import { config } from "../config";
import { pullRequestResultSchema } from "../schema/pullRequestResultSchema";

export async function createRemediationPullRequest(incident:Incident):Promise<PullRequestResult>{
    const remediationBranch = incident.branch;
    
    if(!remediationBranch.startsWith("ai-fix")){
        throw new Error("Invalid remediation branch");
    }

    const title= `AI remediation: CI failure ${incident}`;

    const body = `
        ## AI Self-healing Remediation

        ### Incident
        - Incident: ${incident.id}
        - workflow: ${incident.workflowName}
        - commit: ${incident.commitSha}

        ## Remediation

        This pull request was automatically created after the AI remdiation branch passed CI validation

        - Remediation branch: ${remediationBranch}

        ## Validation

        The remediation branch successfully passed GitHub Actions validation

        ## Review

        Please review the changes before merging. This PR was created automatically by the Self-Healing CI/CD system
    `
    const response = await openai.responses.create({
        model: config.openaiModel,
        instructions:`
            You are a GitHub pull request creation agent.

            Your ONLY responsibility is to create a pull request.

            ** Do not modify repository files. **
            ** Do not create commits **
            ** Do not create branches **
            ** Do not modify the remediation branch **
            ** Do not modify main. **
            ** Do not merge the pull request **

            Create exactly one pull request with:
            Repository:${incident.repository}
            Base branch:main
            Head branch:${remediationBranch}
            Title:${title}
            Body:${body}

            - The pull request must target main.
            - Create it as a DRAFT pull request.
            - If a pull request already exists from this head branch to main, do not create a duplicate.
            - Return the pull request number, URL, head branch and base branch.
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
        text: {
            format: {
                type: "json_schema",
                name: "ci_patch",
                strict: true,
                schema: pullRequestResultSchema
            }
        },
        input:`
            Create a draft pull request.

            Repository:${incident.repository}
            Base:main
            Head:${remediationBranch}
        `
    })

    const output = response.output_text;

    if(!output){
        throw new Error(`Github PR creator returned empty response`)
    }

    let result: PullRequestResult;
    try{
        result = JSON.parse(output) as PullRequestResult;
    }catch(error){
        throw new Error("PR creator returned invalid json")
    }

    if(!result.success){
        throw new Error(`PR creation failed: ${result.message}`);
    }

    if(result.branch !==remediationBranch){
        throw new Error(`Unexpected PR head branch: ${result.branch}`);
    }

    return result;
}