import { handler } from "./lambda/handler.js";

const event = {
  httpMethod: "POST",
  body: JSON.stringify({
    action: "updateMetadata",
    machineId: "opdb:grxzd-mjbpx",
    commonIssues: ["Clock board faults", "Powerball / gumball handling issues"],
    repairNotes: ["Check clock board voltages first"],
    serviceTags: ["wpc", "widebody", "clock"],
  }),
};

try {
  const result = await handler(event);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Test failed:");
  console.error(error);
}
