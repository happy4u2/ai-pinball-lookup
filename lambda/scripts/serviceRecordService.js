import crypto from "node:crypto";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
    status: data.status || "completed",
    diagnosis: data.diagnosis || "",
    workPerformed: data.workPerformed || "",
    partsUsed: Array.isArray(data.partsUsed) ? data.partsUsed : [],
    laborCost: typeof data.laborCost === "number" ? data.laborCost : null,
    notes: data.notes || "",
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
  if (!serviceId) return null;

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
