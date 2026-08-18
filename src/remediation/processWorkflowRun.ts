import { WorkflowRunWebhookPayload } from "../models/webhook";
import { createIncidentId,saveIncident, updateIncident } from "./incident";
import { Incident } from "../models/incident";
import { investigate } from "../openai/investigator";
import { evaluateRemediation } from "../safety/policy";
import { generatePatch } from "../openai/patchGenerator";
import { validatePatchPolicy } from "../safety/patchPolicy";

export async function processWorkflowRun(payload:WorkflowRunWebhookPayload):Promise<void>{
    const { workflow_job,repository } = payload;

    const incident:Incident = {
        id: createIncidentId(),
        repository:repository.full_name,
        workflowName: workflow_job.name,
        workflowRunId: workflow_job.id,
        branch: workflow_job.head_branch,
        commitSha: workflow_job.head_sha,
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
    validatePatchPolicy(patch);

}