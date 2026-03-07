import { opdbService } from "./scripts/opdbService.js";

console.log("test-opdb.js started");

async function main() {
  try {
    console.log("Calling opdbService...");
    const result = await opdbService("Twilight Zone");

    console.log("Service returned:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test failed:");
    console.error(err);
  }
}

main();