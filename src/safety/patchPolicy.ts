import type { Patch } from "../models/patch.js";

const PROTECTED_PATHS:string[] = [];

const MAX_FILES_CHANGED = 5;

const MAX_DIFF_LINES = 80;

function isProtectedPath(
  path: string
): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      path === protectedPath ||
      path.startsWith(protectedPath)
  );
}

function countDiffLines(
  diff: string
): number {
  return diff
    .split("\n")
    .filter(
      (line) =>
        line.startsWith("+") ||
        line.startsWith("-")
    )
    .length;
}

export function validatePatchPolicy(
  patch: Patch
): void {
  if (!patch.canPatch) {
    throw new Error(
      "A safe patch cannot be generated."
    );
  }

  if (
    patch.files.length === 0
  ) {
    throw new Error(
      "Patch does not contain any files."
    );
  }

  if (
    patch.files.length >
    MAX_FILES_CHANGED
  ) {
    throw new Error(
      `Patch changes more than ${MAX_FILES_CHANGED} files.`
    );
  }

  for (const file of patch.files) {
    if (
      isProtectedPath(file.path)
    ) {
      throw new Error(
        `Protected file detected: ${file.path}`
      );
    }

    const diffLines =
      countDiffLines(file.diff);

    if (
      diffLines > MAX_DIFF_LINES
    ) {
      throw new Error(
        `Patch for ${file.path} is too large.`
      );
    }
  }
}
