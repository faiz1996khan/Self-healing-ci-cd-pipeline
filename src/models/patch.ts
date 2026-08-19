import { Diagnosis, RiskLevel } from "./diagnosis";

export interface PatchFile {
    path: string;
    diff: string;
    originalContent: string;
}

export interface Patch {
    canPatch: boolean;
    explanation: string;
    files: PatchFile[];
    risk: RiskLevel;
}

export interface PatchContext{ 
    diagnosis: Diagnosis;
    files: Array<{ 
        path: string;
        content: string; 
    }>; 
}

export interface FilePatch { 
    path: string;
    diff: string; 
} 

export interface AppliedFile{ 
    path: string; 
    originalContent: string; 
    updatedContent: string; 
}

export interface PatchApplicationResult{
    success: boolean;
    branch: string;
    commitSha?: string;
    modifiedFiles: string[];
    message: string;
}