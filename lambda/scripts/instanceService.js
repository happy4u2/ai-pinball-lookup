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

const ALLOWED_OWNERSHIP_TYPES = new Set([
  "customer",
  "swisspinball",
  "consignment",
  "unknown",
]);

const ALLOWED_LOCATION_TYPES = new Set([
  "workshop",
  "storage",
  "customer_site",
  "on_rent",
  "sold_pending_delivery",
  "in_transit",
  "parts_machine",
  "unknown",
]);

const ALLOWED_RENTAL_STATUS = new Set([
  "active",
  "paused",
  "ended",
  "none",
  "unknown",
]);

const ALLOWED_STATUS = new Set([
  "active",
  "in_service",
  "awaiting_parts",
  "ready",
  "stored",
  "rented",
  "sold",
  "out_of_service",
  "unknown",
]);

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

function sanitizeNullableString(value) {
  const cleaned = sanitizeString(value);
  return cleaned || null;
}

function sanitizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function sanitizeEnum(value, allowedValues, fallback) {
  const cleaned = sanitizeString(value).toLowerCase();
  return allowedValues.has(cleaned) ? cleaned : fallback;
}

function normalizeOwnershipType(value) {
  return sanitizeEnum(value, ALLOWED_OWNERSHIP_TYPES, "unknown");
}

function normalizeLocationType(value) {
  return sanitizeEnum(value, ALLOWED_LOCATION_TYPES, "unknown");
}

function normalizeRentalStatus(value) {
  return sanitizeEnum(value, ALLOWED_RENTAL_STATUS, "none");
}

function normalizeStatus(value) {
  return sanitizeEnum(value, ALLOWED_STATUS, "active");
}

function buildNormalizedInstancePayload(data = {}, existing = null) {
  const customerId = sanitizeNullableString(data.customerId);
  const ownershipType = normalizeOwnershipType(
    data.ownershipType || existing?.ownershipType
  );

  const ownerCustomerId =
    sanitizeNullableString(data.ownerCustomerId) ||
    (ownershipType === "customer"
      ? customerId || existing?.ownerCustomerId || existing?.customerId || null
      : null);

  const assignedCustomerId =
    sanitizeNullableString(data.assignedCustomerId) || null;

  const rentalStatus = normalizeRentalStatus(
    data.rentalStatus || existing?.rentalStatus
  );

  return {
    customerId: customerId || existing?.customerId || null,
    machineId: sanitizeString(data.machineId || existing?.machineId),
    machineName: sanitizeString(data.machineName || existing?.machineName),
    instanceName: sanitizeString(data.instanceName || existing?.instanceName),
    location: sanitizeString(data.location || existing?.location),
    currentLocationType: normalizeLocationType(
      data.currentLocationType || existing?.currentLocationType
    ),
    currentLocationLabel: sanitizeString(
      data.currentLocationLabel || existing?.currentLocationLabel
    ),
    ownershipType,
    ownerCustomerId,
    assignedCustomerId,
    rentalStatus,
    condition: sanitizeString(data.condition || existing?.condition || "unknown"),
    status: normalizeStatus(data.status || existing?.status || "active"),
    serialNumber: sanitizeString(data.serialNumber || existing?.serialNumber),
    notes: sanitizeString(data.notes || existing?.notes),
    tags:
      data.tags !== undefined
        ? sanitizeArray(data.tags)
        : sanitizeArray(existing?.tags),
  };
}

/*
Create Instance
*/

export async function createInstance(data) {
  const timestamp = nowIso();
  const normalized = buildNormalizedInstancePayload(data);

  const instance = {
    instanceId: buildInstanceId(),

    // machine identity
    machineId: normalized.machineId,
    machineName: normalized.machineName,
    instanceName: normalized.instanceName,

    // ownership
    ownershipType: normalized.ownershipType,
    ownerCustomerId: normalized.ownerCustomerId,

    // location / assignment
    location: normalized.location, // legacy compatibility field
    currentLocationType: normalized.currentLocationType,
    currentLocationLabel: normalized.currentLocationLabel,
    assignedCustomerId: normalized.assignedCustomerId,
    rentalStatus: normalized.rentalStatus,

    // state
    condition: normalized.condition,
    status: normalized.status,
    serialNumber: normalized.serialNumber,
    notes: normalized.notes,
    tags: normalized.tags,

    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (normalized.customerId) {
    instance.customerId = normalized.customerId;
  }

  if (!instance.machineId) {
    throw new Error("Missing machineId");
  }

  if (instance.ownershipType === "customer" && !instance.ownerCustomerId) {
    throw new Error("Missing ownerCustomerId for customer-owned instance");
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: instance,
    })
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
    })
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
    })
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
    })
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
    })
  );

  return result.Items || [];
}

/*
Update Instance
*/

export async function updateInstance(instanceId, data) {
  const existing = await getInstance(instanceId);

  if (!existing) {
    throw new Error("Instance not found");
  }

  const timestamp = nowIso();
  const normalized = buildNormalizedInstancePayload(data, existing);

  if (normalized.ownershipType === "customer" && !normalized.ownerCustomerId) {
    throw new Error("Missing ownerCustomerId for customer-owned instance");
  }

  const updates = [];
  const names = {};
  const values = {};

  const fields = {
    ...(normalized.customerId ? { customerId: normalized.customerId } : {}),

    machineId: normalized.machineId,
    machineName: normalized.machineName,
    instanceName: normalized.instanceName,

    ownershipType: normalized.ownershipType,
    ownerCustomerId: normalized.ownerCustomerId,

    location: normalized.location,
    currentLocationType: normalized.currentLocationType,
    currentLocationLabel: normalized.currentLocationLabel,
    assignedCustomerId: normalized.assignedCustomerId,
    rentalStatus: normalized.rentalStatus,

    condition: normalized.condition,
    status: normalized.status,
    serialNumber: normalized.serialNumber,
    notes: normalized.notes,
    tags: normalized.tags,
  };

  for (const [key, value] of Object.entries(fields)) {
    names[`#${key}`] = key;
    values[`:${key}`] = value;
    updates.push(`#${key} = :${key}`);
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
    })
  );

  return result.Attributes || null;
}