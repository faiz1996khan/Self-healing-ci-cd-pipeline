import { applyPatch } from "diff";
import { investigate } from "../llm-calls/investigator";
import { generatePatch } from "../llm-calls/patchGenerator";
import { Incident } from "../models/incident";
import { validatePatchPolicy } from "../safety/patchPolicy";
import { evaluateRemediation } from "../safety/policy";
import { updateIncident } from "./incident";
import { applyPatchSet } from "./patcher";
import { patchApplier } from "../llm-calls/patchApplier";

export async function retryRemediation(incident:Incident):Promise<void>{
    console.log(`Retry attempt started ${incident.id}`)
    const diagnosis = await investigate(incident);
    const decision = await evaluateRemediation(diagnosis);
    if(!decision.allowed){
        updateIncident(incident.id,{status:"ESCALATED"})
        return;
    }
    const patch = await generatePatch(diagnosis);
    validatePatchPolicy(patch);
    const fileContents =new Map(patch.files.map(file => [file.path,file.originalContent]));
    applyPatchSet(patch.files,fileContents);
    await patchApplier(incident,patch);
    updateIncident(incident.id,{status:"VALIDATING"});
    console.log(`Atempt ${incident.attempt} submitted.`)
}