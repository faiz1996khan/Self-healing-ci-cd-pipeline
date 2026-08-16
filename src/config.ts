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
    githubMcpServerUrl: getRequiredEnv("GITHUB_MCP_SERVER_URL")
}