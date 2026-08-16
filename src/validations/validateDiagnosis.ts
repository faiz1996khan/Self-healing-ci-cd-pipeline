import { Diagnosis } from "../models/diagnosis";

const failureCategories = new Set([ "DEPENDENCY", "TYPE_ERROR", "TEST_FAILURE", "LINT_FAILURE", "BUILD_FAILURE", "CONFIGURATION", "AUTHENTICATION", "NETWORK", "INFRASTRUCTURE", "UNKNOWN" ]);

const riskLevels = new Set([ "LOW", "MEDIUM", "HIGH" ]);

export function validateDiagnosis(value:unknown): asserts value is Diagnosis{
    if(!value || typeof value !== "object"){
        throw new Error("Diagnosis must be an object")
    }

    const diagnosis = value as Record<string,unknown>;

    if(typeof diagnosis.category !== "string" || !failureCategories.has(diagnosis.category)){
        throw new Error("Diagnosis.category is invalid")
    }

    if(typeof diagnosis.confidence !== "number" || diagnosis.confidence < 0 || diagnosis.confidence > 1){
        throw new Error("Diagnosis.confidence must be between 0 and 1")
    }

    if(typeof diagnosis.rootCause !== "string"){
        throw new Error("Diagnosis.rootCause must be a string")
    }

    if(!Array.isArray(diagnosis.affectedFiles) || diagnosis.affectedFiles.some(file => typeof file !== "string")){
        throw new Error("Diagnosis.affectedFiles must be a string array")
    }

    if(typeof diagnosis.recommendedAction !== "string"){
        throw new Error("Diagnosis.recommendedAction must be a string")
    }

    if(typeof diagnosis.risk !== "string" || !riskLevels.has(diagnosis.risk)){
        throw new Error("Diagnosis.risk is invalid")
    }
}

