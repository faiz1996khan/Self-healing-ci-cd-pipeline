# AI Self-Healing CI/CD Pipeline

Event-driven AI SRE that detects failed GitHub Actions workflows, diagnoses the root cause, generates a safe code fix, validates it through CI, and creates a remediation PR.

## Overview & Architecture:
This project automates a common developer workflow:

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/541cd66a-0050-460e-add6-49bc46fff869" />

The AI never modifies main directly. Fixes are created on an isolated remediation branch and must pass CI before a PR is created.

## Key Design:
Event-driven: GitHub workflow_run webhooks trigger remediation.

AI reasoning: OpenAI analyzes workflow failures, logs, and repository context to determine the root cause and propose a minimal fix.

GitHub MCP: GitHub MCP is used for repository/workflow operations, including remediation branches and pull requests.

Safety first: Patches are checked for risk, protected paths, size, and applicability before they are applied.

Bounded autonomy: Remediation is limited to 3 attempts. Unsafe or uncertain failures are escalated instead of being modified blindly.

## Technology:
 - Node.js + TypeScript
 - OpenAI Responses API
 - GitHub Actions
 - GitHub Webhooks
 - GitHub MCP Server
 - Express
 - Mocha and Chai

## Example

A pipeline fails with:

TS2322:
Type 'number' is not assignable to type 'string'

The system:

Receives the workflow failure webhook.
Creates an incident.
Uses OpenAI to identify the root cause.
Generates a minimal patch.
Applies safety checks.
Creates ai-fix/<incident-id> through GitHub MCP.
Runs GitHub Actions again.
Retries if necessary, up to 3 attempts.
Creates a Draft PR after successful validation.


## Why this project?

The goal is not simply to add AI to CI/CD. It demonstrates how to build controlled autonomous remediation with clear boundaries between:

* AI reasoning
* deterministic safety policies
* GitHub automation
* CI verification

That makes the system practical, auditable, and suitable for human review.

Current Scope
- Failure detection
- AI diagnosis
- Patch generation
- Safety validation
- Automated remediation
- Bounded retries
- CI verification
- Draft PR creation

** Automatic merge intentionally excluded
