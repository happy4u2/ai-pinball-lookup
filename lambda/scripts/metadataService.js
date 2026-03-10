import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";

const TABLE_NAME =
  process.env.METADATA_TABLE_NAME || "pinball_machine_metadata";

export async function getMetadata(machineId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { machineId },
    }),
  );

  return result.Item || null;
}

export async function saveMetadata(record) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
    }),
  );

  return record;
}
