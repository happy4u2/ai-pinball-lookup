import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";

const TABLE_NAME = process.env.MACHINE_TABLE_NAME;

function requireTableName() {
  if (!TABLE_NAME) {
    throw new Error("Missing MACHINE_TABLE_NAME environment variable");
  }
}

export function buildMachineKey(machineName) {
  if (!machineName) {
    throw new Error("Missing machineName");
  }

  return machineName.trim().toLowerCase();
}

export async function getCachedMachine(machineName) {
  requireTableName();

  const machineKey = buildMachineKey(machineName);

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { machineKey }
  });

  const response = await docClient.send(command);
  return response.Item ?? null;
}

export async function saveCachedMachine(machineName, payload) {
  requireTableName();

  const machineKey = buildMachineKey(machineName);

  const item = {
    machineKey,
    query: machineName,
    source: payload.source,
    selectedMatch: payload.selectedMatch,
    result: payload.result,
    cachedAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });

  await docClient.send(command);

  return item;
}