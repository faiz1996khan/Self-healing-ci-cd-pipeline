export interface ValidationResult {
    success: boolean;
    lintPassed: boolean;
    testPassed: boolean;
    buildPassed: boolean;
    output: string;
    failedCommand?: string;
}