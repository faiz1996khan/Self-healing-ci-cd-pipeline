import { applyPatch } from "diff";
import { FilePatch, AppliedFile } from "../models/patch";

export function applyFilePatch(file:FilePatch,originalContent:string):AppliedFile{
    const updatedContent = applyPatch(originalContent,file.diff);

    if(!updatedContent){
        throw new Error(`Failed to apply patch to ${file.path}`);
    }

    return {
        path: file.path,
        originalContent,
        updatedContent
    }
}

export function applyPatchSet(files:FilePatch[],contents:Map<string,string>):AppliedFile[] {
    const appliedFile: AppliedFile[] = [];

    for(const file of files){
        const originalContent = contents.get(file.path);
        if(!originalContent){
            throw new Error(`Origional content not found for ${file.path}`);
        }

        appliedFile.push(applyFilePatch(file,originalContent));
    }
    return appliedFile;
}