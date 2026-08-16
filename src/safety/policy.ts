import { Diagnosis } from "../models/diagnosis";
import { RemediationDecision } from "../models/safety";

const AUTO_FIX_CONFIDENCE = 0.90;

function getDecision(allowed:boolean,reason:string): RemediationDecision{
    return {
        allowed,
        reason
    }
}

export function  evaluateRemediation(diagnosis: Diagnosis): RemediationDecision{
    if(diagnosis.confidence < AUTO_FIX_CONFIDENCE){
        return getDecision(false,`Confidence ${diagnosis.confidence} is below ${AUTO_FIX_CONFIDENCE}`)
    }
    
    if(diagnosis.risk !== "LOW" && diagnosis.risk !== "MEDIUM"){
        return getDecision(false,`Risk level ${diagnosis.risk} requires human review`)
    }

    return getDecision(true,`Diagnosis meets the automatic remediation policy`)
}