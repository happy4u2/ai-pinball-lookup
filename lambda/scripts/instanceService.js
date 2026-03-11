import crypto from "node:crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";

const TABLE_NAME = process.env.INSTANCE_TABLE || "pinball_machine_instances";

/*
Helpers
*/

function nowIso() {
  return new Date().toISOString();
}

function buildInstanceId() {
  return `inst:${crypto.randomUUID()}`;
}

function sanitizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/*
Create Instance
*/

export async function createInstance(data) {
  const timestamp = nowIso();

  const instance = {
    instanceId: buildInstanceId(),
    customerId: sanitizeString(data.customerId),
    machineId: sanitizeString(data.machineId),
    machineName: sanitizeString(data.machineName),
    location: sanitizeString(data.location),
    condition: sanitizeString(data.condition || "unknown"),
    status: sanitizeString(data.status || "active"),
    serialNumber: sanitizeString(data.serialNumber),
    notes: sanitizeString(data.notes),
    tags: sanitizeArray(data.tags),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!instance.customerId) {
    throw new Error("Missing customerId");
  }

  if (!instance.machineId) {
    throw new Error("Missing machineId");
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: instance,
    }),
  );

  return instance;
}

/*
Get One Instance
*/

export async function getInstance(instanceId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { instanceId },
    }),
  );

  return result.Item || null;
}

/*
List All Instances
*/

export async function listInstances() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  return result.Items || [];
}

/*
List Instances By Customer
*/

export async function listInstancesByCustomer(customerId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "customerId-index",
      KeyConditionExpression: "customerId = :customerId",
      ExpressionAttributeValues: {
        ":customerId": customerId,
      },
    }),
  );

  return result.Items || [];
}

/*
List Instances By Machine Model
*/

export async function listInstancesByMachine(machineId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "machineId-index",
      KeyConditionExpression: "machineId = :machineId",
      ExpressionAttributeValues: {
        ":machineId": machineId,
      },
    }),
  );

  return result.Items || [];
}

/*
Update Instance
*/

export async function updateInstance(instanceId, data) {
  const timestamp = nowIso();

  const updates = [];
  const names = {};
  const values = {};

  const fields = {
    customerId: data.customerId,
    machineId: data.machineId,
    machineName: data.machineName,
    location: data.location,
    condition: data.condition,
    status: data.status,
    serialNumber: data.serialNumber,
    notes: data.notes,
    tags: data.tags,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      names[`#${key}`] = key;

      values[`:${key}`] =
        key === "tags" ? sanitizeArray(value) : sanitizeString(value);

      updates.push(`#${key} = :${key}`);
    }
  }

  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = timestamp;
  updates.push("#updatedAt = :updatedAt");

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { instanceId },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    }),
  );

  return result.Attributes || null;
}
