import { opdbService } from "./scripts/opdbService.js";

console.log("test-opdb.js started");

async function main() {
  try {
    console.log("Calling opdbService...");
    const result = await opdbService("Medieval Madness");
    console.log("Service returned:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test failed:");
    console.error(err);
    process.exit(1);
  }
}

main();