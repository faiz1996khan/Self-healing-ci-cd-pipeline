export interface WorkflowRun {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    head_sha: string;
    head_branch: string;
}

export interface WorkflowRunWebhookPayload {
    action: "requested" | "in_progress" | "completed";
    workflow_run: WorkflowRun;
    repository: {
        full_name: string;
    }
}