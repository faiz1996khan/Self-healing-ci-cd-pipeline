export const patchApplicationSchema = { 
    type: "object", 
    properties: { 
        success: { 
            type: "boolean" 
        }, 
        branch: { 
            type: "string" 
        },
        commitSha: {
            type: "string"
        },
        modifiedFiles: {
            type: "array",
            items: {
                type: "string"
            }
        },
        message: {
            type: "string"
        }
    }, 
    required: ["success","branch","modifiedFiles","message"], 
    additionalProperties: false 
} as const;