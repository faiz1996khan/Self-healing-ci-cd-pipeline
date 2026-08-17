import express, { Response } from "express";
import { handleWebhook } from "./handler";
import { config } from "../config";
const PORT = config.port || 3000;

const app = express();

app.use(express.json({
    verify: (req:any,_res:Response,buff: Buffer) => {
        req.rawBody = buff.toString("utf-8");
    }
}))

app.post("/github/webhook",(req:any,res:any) => {
    try{
        const result = handleWebhook(req.rawBody,req.headers);

        res.status(result.statusCode).json({
            message: result.message
        })
    }catch(error){
        console.error(`Webhook processing failed: ${JSON.stringify(error)}`);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.use((_req, res) => { 
    res.status(404).send("Not Found");
}); 

app.listen(PORT, () => { 
    console.log(`Webhook server listening on ${PORT}`); 
});