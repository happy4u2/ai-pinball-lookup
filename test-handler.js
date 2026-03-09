import fs from "fs";
import { handler } from "./lambda/handler.js";

async function run() {

  const event = JSON.parse(
    fs.readFileSync("./test-event.json", "utf8")
  );

  const result = await handler(event);

  console.log("\nLambda response:\n");
  console.log(JSON.stringify(result, null, 2));

}
run();