import crypto from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export function nowIso() {
  return new Date().toISOString();
}

export function newStatusEventId() {
  return `stat:${crypto.randomUUID()}`;
}

export function normalizeOptionalString(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

export async function writeInstanceStatusHistory({
  dynamo,
  tableName,
  instanceId,
  fromStatus,
  toStatus,
  fromSubStatus,
  toSubStatus,
  changedBy = "system",
  note = "",
}) {
  const item = {
    statusEventId: newStatusEventId(),
    instanceId,
    fromStatus: normalizeOptionalString(fromStatus),
    toStatus: normalizeOptionalString(toStatus),
    fromSubStatus: normalizeOptionalString(fromSubStatus),
    toSubStatus: normalizeOptionalString(toSubStatus),
    changedAt: nowIso(),
    changedBy: normalizeOptionalString(changedBy) || "system",
    note: normalizeOptionalString(note) || "",
  };

  await dynamo.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );

  return item;
}