import { Diagnosis, RiskLevel } from "./diagnosis";

export interface PatchFile {
    path: string;
    diff: string;
}

export interface Patch {
    canPatch: boolean;
    explanation: string;
    files: PatchFile[];
    risk: RiskLevel;
}

export interface PatchContext { 
    diagnosis: Diagnosis;
    files: Array<{ 
        path: string;
        content: string; 
    }>; 
}