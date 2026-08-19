import { PatchApplicationResult } from "../models/patch";

export function validatePatchApplication(
  value: unknown
): asserts value is PatchApplicationResult {
  if(!value || typeof value !== "object"){
    throw new Error("Patch application result must be an object");
  }
  const result=value as Record<string, unknown>;

  if(typeof result.success !=="boolean") {
    throw new Error("Patch application success must be a boolean");
  }

  if(typeof result.branch !== "string"){
    throw new Error("Patch application branch must be a string");
  }

  if (!Array.isArray(result.modifiedFiles)){
    throw new Error("modifiedFiles must be an array");
  }

  if(typeof result.message !=="string"){
    throw new Error("Patch application message must be a string");
  }
}