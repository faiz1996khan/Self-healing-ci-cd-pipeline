import { WorkflowRunWebhookPayload } from "../models/webhook";
import { createIncidentId,saveIncident, updateIncident } from "./incident";
import { Incident } from "../models/incident";
import { investigate } from "../llm-calls/investigator";
import { evaluateRemediation } from "../safety/policy";
import { generatePatch } from "../llm-calls/patchGenerator";
import { validatePatchPolicy } from "../safety/patchPolicy";
import { applyPatchSet } from "./patcher";
import { patchApplier } from "../llm-calls/patchApplier";

export async function processWorkflowRun(payload:WorkflowRunWebhookPayload):Promise<void>{
    const { workflow_run,repository } = payload;

    const incident:Incident = {
        id: createIncidentId(),
        repository:repository.full_name,
        workflowName: workflow_run.name,
        workflowRunId: workflow_run.id,
        branch: workflow_run.head_branch,
        commitSha: workflow_run.head_sha,
        status: "DETECTED",
        attempt:0,
        maxAttempt:3,
        createdAt: new Date().toISOString()
    }

    saveIncident(incident);
    console.log(`created incident ${incident.id}`);
    console.log(`starting investigation`);

    const diagnosis = await investigate(incident);
    console.log(`Diagnosis : ${JSON.stringify(diagnosis)}`);
    const decision = evaluateRemediation(diagnosis);

    if(!decision.allowed){
        updateIncident(incident.id,{status:"ESCALATED"});
        console.log(`Incident ${incident.id} escalated`);
        return;
    }

    updateIncident(incident.id,{status: "PATCHING"});
    const patch = await generatePatch(diagnosis);
    for (const file of patch.files) {
        console.log(`\nFile: ${file.path}`);
        console.log(file.diff);
    }
    validatePatchPolicy(patch);
    const fileContents = new Map(patch.files.map(file => [file.path,file.originalContent]));
    const appliedFiles = applyPatchSet(patch.files,fileContents);
    console.log(`Validated ${appliedFiles.length} files patched.`);
    const result = await patchApplier(incident,patch);
    //verifyPatchTarget(fileContents.originalContent,fileContents.originalContent);
    console.log(JSON.stringify(result));
    updateIncident(incident.id,{status:"VALIDATING"});
    console.log(`Waiting for GitHub validation for incident ${incident.id}...`);
}