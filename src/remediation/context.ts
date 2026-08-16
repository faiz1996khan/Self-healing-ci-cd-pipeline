import { Diagnosis } from "../models/diagnosis";
import { PatchContext } from "../models/patch";

export function buildPatchContext(diagnosis:Diagnosis,files:Array<{path:string,content:string}>):PatchContext {
    return {
        diagnosis,
        files
    }
}