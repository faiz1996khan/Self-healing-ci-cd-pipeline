export type IncidentStatus = "DETECTED" | "INVESTIGATING" | "PATCHING" | "VALIDATING" | "RECOVERED" | "ESCALATED" | "PR_CREATED";

export interface Incident {
    id: string;
    repository: string;
    workflowName: string;
    workflowRunId: number;
    branch: string;
    commitSha: string;
    status: IncidentStatus;
    attempt: number;
    maxAttempt: number;
    createdAt: string;
}

export interface IncidentContext {
    incidentId: string;
    repository: string;
    workflowRunId: number;
    workflowName: string;
    branch: string;
    commitSha: string;
}