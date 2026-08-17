import "dotenv/config";

function getRequiredEnv(name:string){
    const value = process.env[name];
    if(!value){
        throw new Error("Environment varibales missing");
    }

    return value;
}

export const config = {
    openaiApiKey: getRequiredEnv("OPENAI_API_KEY"),
    openaiModel: getRequiredEnv("OPENAI_MODEL"),
    githubPat: getRequiredEnv("GITHUB_PAT"),
    githubOwner: getRequiredEnv("GITHUB_OWNER"),
    githubRepo: getRequiredEnv("GITHUB_REPO"),
    githubMcpServerUrl: getRequiredEnv("GITHUB_MCP_SERVER_URL"),
    maxRemediationAttempts: getRequiredEnv("MAX_REMEDIATION_ATTEMPTS"),
    autoFixConfidence: getRequiredEnv("AUTO_FIX_CONFIDENCE"),
    protectedPaths: getRequiredEnv("PROTECTED_PATHS"),
    githubWebhookSecret: getRequiredEnv("GITHUB_WEBHOOK_SECRET"),
    port: getRequiredEnv("PORT")
}