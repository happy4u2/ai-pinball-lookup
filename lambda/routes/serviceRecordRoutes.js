import crypto from "node:crypto";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";

const TABLE_NAME = "pinball_service_history";
const INSTANCE_INDEX = "instanceId-index";

function newServiceId() {
  return `srv:${crypto.randomUUID()}`;
}

export async function createServiceRecord(data) {
  if (!data?.instanceId) {
    throw new Error("instanceId is required");
  }

  const now = new Date().toISOString();

  const item = {
    serviceId: newServiceId(),
    instanceId: data.instanceId,
    customerId: data.customerId || null,
    machineId: data.machineId || null,
    serviceDate: data.serviceDate || now.slice(0, 10),
    technician: data.technician || null,
    serviceType: data.serviceType || "repair",
    status: data.status || "open",
    laborCost: data.laborCost ?? 0,
    notes: data.notes || "",
    partsUsed: Array.isArray(data.partsUsed) ? data.partsUsed : [],
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return item;
}

export async function getServiceRecord(serviceId) {
  if (!serviceId) {
    throw new Error("serviceId is required");
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { serviceId },
    }),
  );

  return result.Item || null;
}

export async function listServiceRecordsByInstance(instanceId) {
  if (!instanceId) {
    throw new Error("instanceId is required");
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: INSTANCE_INDEX,
      KeyConditionExpression: "instanceId = :instanceId",
      ExpressionAttributeValues: {
        ":instanceId": instanceId,
      },
    }),
  );

  return result.Items || [];
}

export async function updateServiceRecord(serviceId, data) {
  if (!serviceId) {
    throw new Error("serviceId is required");
  }

  const allowedFields = ["status", "laborCost", "notes", "partsUsed"];
  const fields = Object.keys(data || {}).filter((key) =>
    allowedFields.includes(key),
  );

  if (fields.length === 0) {
    throw new Error(
      "No valid fields to update. Allowed fields: status, laborCost, notes, partsUsed",
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "laborCost") &&
    typeof data.laborCost !== "number"
  ) {
    throw new Error("laborCost must be a number");
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "partsUsed") &&
    !Array.isArray(data.partsUsed)
  ) {
    throw new Error("partsUsed must be an array");
  }

  const now = new Date().toISOString();

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const field of fields) {
    updateExpressions.push(`#${field} = :${field}`);
    expressionAttributeNames[`#${field}`] = field;
    expressionAttributeValues[`:${field}`] = data[field];
  }

  updateExpressions.push("#updatedAt = :updatedAt");
  expressionAttributeNames["#updatedAt"] = "updatedAt";
  expressionAttributeValues[":updatedAt"] = now;

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { serviceId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(serviceId)",
      ReturnValues: "ALL_NEW",
    }),
  );

  return result.Attributes;
}
