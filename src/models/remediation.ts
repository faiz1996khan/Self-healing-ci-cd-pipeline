export interface RemediationDecision {
    allowed: boolean;
    reason: string;
}

export type RemediationStatus = "STARTED" | "PATCH_APPLIED" | "CI_RUNNING" | "SUCCEEDED" | "FAILED" | "ESCALATED";

export interface RemediationAttempt{
    attemptNumber: number;
    branch: string;
    status: RemediationStatus;
    commitSha?: string;
    workflowRunId?: number;
    diagnosis?: string;
    patchSummary?: string;
    validationOutput?: string;
    startedAt: string;
    completedAt?: string;
}

export interface RemediationState {
    incidentId: string;
    branch: string;
    maxAttempts: number;
    currentAttempt: number;
    attempts: RemediationAttempt[];
    status: "ACTIVE" | "RECOVERED" | "ESCALATED";
}