import { investigate } from "./openai/investigator";
import { generatePatch } from "./openai/patchGenerator";
import { evaluateRemediation } from "./safety/policy";

async function main(): Promise<void> {
  console.log("========================================");
  console.log("          DIAGNOSTIC ENGINE");
  console.log("========================================");

  const diagnosis = await investigate();

  console.log("========================================");
  console.log("             DIAGNOSIS");
  console.log("========================================");
  for (const [key, value] of Object.entries(diagnosis)) {
    console.log(`${key}: ${value} \n`);
  }

  const decision = evaluateRemediation(diagnosis);

  console.log(`\n============ POLICY =================\n`);
  console.log(`Automatic remediation allowed: ${decision.allowed}\n`)
  console.log(`Reason: ${decision.reason}`)

  if(!decision.allowed){
    console.log("\n Remediation stopped");
    return;
  }

  console.log("\n Genearating remediation patch...\n");

  const patch = await generatePatch(diagnosis);

  console.log(`\n============ PATCH =================\n`);
  console.log(`Can patch: ${patch.canPatch}\n`);
  console.log(`Risk: ${patch.risk}\n`);
  console.log(`Explanation: ${patch.explanation}\n`);
  console.log( "Files:" );
  for(const file of patch.files){ 
    console.log( `\n${file.path}` );
    console.log(file.diff);
  }

}

main().catch((err) => {
  console.log("Diagnosis failure");
  console.log(err);
  process.exit(1);
})