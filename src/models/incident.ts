export type IncidentStatus = "DETECTED" | "INVESTIGATING" | "PATCHING" | "VALIDATING" | "RECOVERED" | "ESCALATED";

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
