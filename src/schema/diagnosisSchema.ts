export const diagnosisSchema = {
    type: "object",
    properties: {
        category:{
            type: "string",
            enum: [
                "DEPENDENCY", "TYPE_ERROR", "TEST_FAILURE", "LINT_FAILURE", "BUILD_FAILURE", "CONFIGURATION", "AUTHENTICATION", "NETWORK", "INFRASTRUCTURE", "UNKNOWN"
            ]
        },
        confidence:{
            type: "number",
            minimum: 0,
            maximum: 1
        },
        rootCause: {
            type: "string"
        },
        affectedFiles: {
            type: "array",
            items: {
                type: "string"
            }
        },
        recommendedAction: {
            type: "string"
        },
        risk: {
            type: "string",
            enum: [
                "LOW", "MEDIUM", "HIGH"
            ]
        }
    },
    required: [
        "category",
        "confidence",
        "rootCause",
        "affectedFiles",
        "recommendedAction",
        "risk"
    ],
    additionalProperties: false
} as const;