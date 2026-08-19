import { IncomingHttpHeaders } from "node:http";
import { verifyGitHubSignature } from "./verifySignature";
import { WorkflowRunWebhookPayload } from "../models/webhook";
import { config } from "../config";
import { processWorkflowRun } from "../remediation/processWorkflowRun";

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

    const deliveryId = headers["x-github-delivery"];
    console.log(`Delivery ID: ${deliveryId}`);

    const event:any = headers["x-github-event"];

    if(event !== "workflow_run"){
        console.log("Event not processed")
        return {
            statusCode: 200,
            message: "Event not processed"
        }
    }

    const payload = JSON.parse(rawBody) as WorkflowRunWebhookPayload;

    if(payload.action !== 'completed'){
        console.log("Event not processed")
        return {
            statusCode: 200,
            message: "Workflow event not processed"
        }
    }

    const { workflow_run:workflowRun } = payload;

    if(workflowRun.conclusion === "failure"){ 
        console.log( "\nCI FAILURE DETECTED" ); 
        setImmediate(() => {
            processWorkflowRun(payload).catch((error:unknown) => {
                console.error("Self healing processor failed");
            })
        });
    } 
    if(workflowRun.conclusion === "success" && workflowRun.head_branch.startsWith("ai-fix/")){ 
        console.log( "\nCI SUCCESS" );
        
    } 
    return { 
        statusCode: 200,
        message: "Webhook processed" 
    };
}