export const pullRequestResultSchema = { 
    type: "object", 
    properties: { 
        success: { 
            type: "boolean" 
        }, 
        pullRequestNumber: { 
            type: "number" 
        },
        pullRequestUrl: {
            type: "string"
        },
        branch: {
            type: "string"
        },
        message: {
            type: "string"
        }
    }, 
    required: ["success","branch","message"], 
    additionalProperties: false 
} as const;
