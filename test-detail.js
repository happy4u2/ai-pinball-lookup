import { handler } from "./lambda/handler.js";

async function main() {
  const event = {
    machineName: "Medieval Madness"
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