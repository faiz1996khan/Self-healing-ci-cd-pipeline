import { WorkflowRunWebhookPayload } from "../models/webhook";
import { createIncidentId,getIncident,saveIncident, updateIncident } from "./incident";
import { Incident } from "../models/incident";
import { investigate } from "../llm-calls/investigator";
import { evaluateRemediation } from "../safety/policy";
import { generatePatch } from "../llm-calls/patchGenerator";
import { validatePatchPolicy } from "../safety/patchPolicy";
import { applyPatchSet } from "./patcher";
import { patchApplier } from "../llm-calls/patchApplier";
import { retryRemediation } from "./retryRemediation";

export async function processWorkflowRun(payload:WorkflowRunWebhookPayload):Promise<void>{
    const { workflow_run,repository } = payload;

    //get the remediation branch
    const remediationIncidentId = getIncidentIdFromBranch(workflow_run.head_branch);

    //if branch is ai-fix/incident-id then do not create new incident
    if(remediationIncidentId){
        await handleRemediationWorkflow(remediationIncidentId,payload);
        return;
    }

    /*
    Now we can create new incident
    provided incident id is not ai-fix/incidentId
    */

    if(workflow_run.conclusion !== 'failure'){
        console.log(`Workflow ${workflow_run.id} completed with ${workflow_run.conclusion}`);
        return;
    }

    //create new incident
    const incident:Incident = {
        id: createIncidentId(),
        repository:repository.full_name,
        workflowName: workflow_run.name,
        workflowRunId: workflow_run.id,
        branch: workflow_run.head_branch,
        commitSha: workflow_run.head_sha,
        status: "DETECTED",
        attempt:1,
        maxAttempt:3,
        createdAt: new Date().toISOString()
    }

    saveIncident(incident);
    console.log(`created incident ${incident.id}`);
    console.log(`starting investigation`);

    updateIncident(incident.id,{status:"INVESTIGATING"});

    const diagnosis = await investigate(incident);
    console.log(`Diagnosis : ${JSON.stringify(diagnosis)}`);
    const decision = evaluateRemediation(diagnosis);

    if(!decision.allowed){
        updateIncident(incident.id,{status:"ESCALATED"});
        console.log(`Incident ${incident.id} escalated`);
        return;
    }

    updateIncident(incident.id,{status: "PATCHING"});
    console.log('generating patch')
    const patch = await generatePatch(diagnosis);
    console.log(JSON.stringify(patch))
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
    console.log(JSON.stringify(result,null,2));
    updateIncident(incident.id,{status:"VALIDATING"});
    console.log(`Waiting for GitHub validation for incident ${incident.id}...`);
}

async function handleRemediationWorkflow(incidentId:string,workflowRun:WorkflowRunWebhookPayload):Promise<void> {
    console.log(`Remediation workflow detected for icnident ${incidentId}`);
    
    const incident = getIncident(incidentId)
    if(!incident){
        console.error(`Incident ${incidentId} not found`);
        return;
    }

    if(workflowRun.workflow_run.status !== "completed"){
        console.log(`Remediation workflow ${workflowRun.workflow_run.id} still running`);
        return;
    }

    if(workflowRun.workflow_run.conclusion === "success"){
        updateIncident(incidentId,{status:"RECOVERED",workflowRunId:workflowRun.workflow_run.id,commitSha:workflowRun.workflow_run.head_sha,branch:workflowRun.workflow_run.head_branch});
         console.log("SELF-HEALING SUCCESS\n");
        console.log(`Incident: ${incidentId}`);
        console.log(`Attempt: ${incident.attempt}`);
        console.log(`Workflow Run: ${workflowRun.workflow_run.id}`);
        console.log(`Commit: ${workflowRun.workflow_run.head_sha}`);
        console.log("Status: RECOVERED");
        return;
    }

    if(workflowRun.workflow_run.conclusion === 'failure'){
        console.log(`Remediation attempt ${incident.attempt} failed`);
        if(incident.attempt >= incident.maxAttempt){
            updateIncident(incidentId,{status:"ESCALATED",workflowRunId:workflowRun.workflow_run.id,commitSha:workflowRun.workflow_run.head_sha});
            console.log(`Incident ${incidentId} escalated after ${incident.attempt} attempts`);
            return;
        }
         const nextAttempt =incident.attempt + 1;
        updateIncident(incidentId,{attempt:nextAttempt,status:"INVESTIGATING",workflowRunId:workflowRun.workflow_run.id,commitSha:workflowRun.workflow_run.head_sha,branch:workflowRun.workflow_run.head_branch});

        const retryIncident: Incident = {
            ...incident,
            attempt:nextAttempt,
            workflowRunId:workflowRun.workflow_run.id,
            commitSha:workflowRun.workflow_run.head_sha,
            branch:workflowRun.workflow_run.head_branch
        };

        console.log(`Starting remediation attempt ${nextAttempt}`);
        await retryRemediation(retryIncident);

        return;
    }
    console.log(`Remediation workflow ${workflowRun.workflow_run.id} completed with conclusion: ${workflowRun.workflow_run.conclusion}`);
}

export function getIncidentIdFromBranch(branch: string):string | null {
    const prefix ="ai-fix/";

    if(!branch.startsWith(prefix)){
        return null;
    }

    const incidentId =branch.slice(prefix.length);
    if (!incidentId) {
        return null;
    }
    return incidentId;
}