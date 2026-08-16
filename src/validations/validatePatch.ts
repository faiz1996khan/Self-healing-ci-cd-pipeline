import { Patch } from "../models/patch";

export function validatePath(value:unknown): asserts value is Patch{
    if(!value || typeof value !== "object"){
        throw new Error("Patch must be an Object");
    }

    const patch = value as Record<string,unknown>;

    if(typeof patch.canPatch !== "boolean"){
        throw new Error("Patch.canPatch must be a boolean");
    }

    if(typeof patch.explanation !== "string"){
        throw new Error("Patch.explanation must be a string");
    }

    if(!Array.isArray(patch.files)){
        throw new Error("Patch.files must be an array");
    }

    for (const file of patch.files){ 
        if(!file || typeof file !== "object"){ 
            throw new Error( "Each patch file must be an object" ); 
        }
        
        const patchFile = file as Record<string, unknown>; 
        if(typeof patchFile.path !== "string"){ 
            throw new Error( "Patch file path must be a string" );
        } 
        if(typeof patchFile.diff !== "string"){ 
            throw new Error( "Patch file diff must be a string" );
        } 
    } 
    
    if(patch.risk !== "LOW" && patch.risk !== "MEDIUM" && patch.risk !== "HIGH"){ 
        throw new Error( "Patch risk is invalid" ); 
    }
}