import { createHmac,timingSafeEqual } from "node:crypto";

export function verifyGitHubSignature(payload:string,signature:string | undefined,secrets:string): boolean{
    if(!signature){
        return false;
    }

    const expectedSignature = `sha256=${createHmac("sha256",secrets).update(payload,"utf-8").digest("hex")}`;
    const expected = Buffer.from(expectedSignature,"utf-8");
    const actual = Buffer.from(signature,"utf-8");

    if(expected.length !== actual.length){
        return false;
    }

    return timingSafeEqual(expected,actual)
}