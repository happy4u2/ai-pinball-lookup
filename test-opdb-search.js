import { opdbService } from "./lambda/scripts/opdbService.js";

async function run() {
  const queries = [
    "addams",
    "addams family",
    "the addams family",
    "jurassic park",
    "twilight zone"
  ];

  for (const q of queries) {
    console.log("\n==============================");
    console.log("QUERY:", q);
    console.log("==============================");

    try {
      const results = await opdbService(q);
      console.log(JSON.stringify(results, null, 2));
    } catch (err) {
      console.error("ERROR:", err.message);
    }
  }
}

run();