import { handler } from "./lambda/handler.js";
import "dotenv/config";

async function main() {
  const event = {
    machineName: "Jurassic Park"
  };

  const result = await handler(event);

  console.log("Lambda result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Test failed:");
  console.error(error);
  process.exit(1);
});