import { Diagnosis } from "./diagnosis";
import { Incident } from "./incident";
import { Patch } from "./patch";

export interface PullRequestResult {
    success: boolean;
    pullRequestNumber?: number;
    pullRequestUrl?: string;
    branch: string;
    message: string;
}

export interface CreatePullRequestInput {
    incident: Incident;
    diagnosis: Diagnosis;
    patch: Patch;
    branch: string;
}