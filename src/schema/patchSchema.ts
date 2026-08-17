export const patchSchema = { 
    type: "object", 
    properties: { 
        canPatch: { 
            type: "boolean" 
        }, 
        explanation: { 
            type: "string" 
        }, 
        files: { 
            type: "array", 
            items: { 
                type: "object", 
                properties: { 
                    path: { 
                        type: "string" 
                    },
                    originalContent: { 
                        type: "string" 
                    },
                    diff: { 
                        type: "string" 
                    } 
                }, 
                required: [ "path", "originalContent", "diff" ], 
                additionalProperties: false 
            } 
        }, 
        risk: { 
            type: "string", 
            enum: [ "LOW", "MEDIUM", "HIGH" ] 
        } 
    }, 
    required: [ "canPatch", "explanation", "files", "risk" ], 
    additionalProperties: false 
} as const;