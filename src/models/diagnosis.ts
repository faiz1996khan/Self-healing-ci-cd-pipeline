export type FailureCategories = "DEPENDENCY" | "TYPE_ERROR" | "TEST_FAILURE" | "LINT_FAILURE" | "BUILD_FAILURE" | "CONFIGURATION" | "AUTHENTICATION" | "NETWORK" | "INFRASTRUCTURE" | "UNKNOWN";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export interface Diagnosis {
    category: FailureCategories;
    confidence: number;
    rootCause: string;
    affectedFiles: string[];
    recommendedAction: string;
    risk: RiskLevel;
}