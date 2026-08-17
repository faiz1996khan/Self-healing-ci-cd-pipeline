import { IncomingHttpHeaders } from "node:http";
import { verifyGitHubSignature } from "./verifySignature";
import { WorkflowRunWebhookPayload } from "../models/webhook";
import { config } from "../config";

export function handleWebhook(rawBody:string,headers:IncomingHttpHeaders):{statusCode:number, message: string} {
    const signatureHeader = headers["x-hub-signature-256"];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    const valid = verifyGitHubSignature(rawBody,signature,config.githubWebhookSecret);
    
    if(!valid){
        return {
            statusCode: 401,
            message: "Invalid webhook signature"
        }
    }

    const event = headers["x-github-event"];

    if(event !== "workflow_run"){
        return {
            statusCode: 200,
            message: "Event not processed"
        }
    }

    const payload = JSON.parse(rawBody) as WorkflowRunWebhookPayload;
    
    if(payload.action !== 'completed'){
        return {
            statusCode: 200,
            message: "Workflow event not processed"
        }
    }

    const { workflow_run:workflowRun } = payload;

    console.log(`Workflow response : ${JSON.stringify(workflowRun)}`);

    if(workflowRun.conclusion === "failure"){ 
        console.log( "\nCI FAILURE DETECTED" ); 
    } 
    if(workflowRun.conclusion === "success"){ 
        console.log( "\nCI SUCCESS" );
    } 
    return { 
        statusCode: 200,
        message: "Webhook processed" 
    };
}