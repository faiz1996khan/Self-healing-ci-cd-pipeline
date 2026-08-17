import { createHash } from "node:crypto";

export function contentHash(content:string):string{
    return createHash("sha256").update(content,"utf-8").digest('hex');
}

export function verifyPatchTarget(expectedContent:string,currentContent:string):void{
    if(contentHash(expectedContent) !== contentHash(currentContent)){
        throw new Error(`Patch target changed`);
    }
}