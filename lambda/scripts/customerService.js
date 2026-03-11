import crypto from "crypto";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDocClient } from "./dynamoClient.js";

const TABLE_NAME = "pinball_customers";

function nowIso() {
  return new Date().toISOString();
}

function normalizePhone(phone = "") {
  const value = String(phone).trim();

  if (!value) return "";

  // remove spaces, dashes, brackets
  let cleaned = value.replace(/[^\d+]/g, "");

  // Swiss local mobile/home format: 0792108272 -> +41792108272
  if (cleaned.startsWith("0")) {
    cleaned = "+41" + cleaned.slice(1);
  }

  // 41792108272 -> +41792108272
  if (/^41\d+$/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

function buildWhatsAppLink(phone = "") {
  const normalized = normalizePhone(phone);
  if (!normalized) return "";

  return `https://wa.me/${normalized.replace(/[^\d]/g, "")}`;
}

function cleanText(value = "") {
  return String(value ?? "").trim();
}

export async function createCustomer(data) {
  const timestamp = nowIso();
  const customerId = `cust:${crypto.randomUUID()}`;

  const phone = normalizePhone(data.phone || "");
  const customer = {
    customerId,
    name: cleanText(data.name),
    phone,
    whatsapp: buildWhatsAppLink(phone),
    email: cleanText(data.email),
    address: cleanText(data.address),
    notes: cleanText(data.notes),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await dynamoDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: customer,
    }),
  );

  return {
    ok: true,
    customer,
  };
}

export async function getCustomer(customerId) {
  const result = await dynamoDocClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { customerId },
    }),
  );

  return result.Item || null;
}

export async function listCustomers() {
  const result = await dynamoDocClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  return {
    ok: true,
    customers: result.Items || [],
  };
}

export async function updateCustomer(customerId, updates) {
  const existing = await getCustomer(customerId);

  if (!existing) {
    return null;
  }

  const nextPhone =
    updates.phone !== undefined
      ? normalizePhone(updates.phone)
      : existing.phone || "";

  const updatedCustomer = {
    ...existing,
    ...(updates.name !== undefined && { name: cleanText(updates.name) }),
    ...(updates.phone !== undefined && { phone: nextPhone }),
    ...(updates.email !== undefined && { email: cleanText(updates.email) }),
    ...(updates.address !== undefined && {
      address: cleanText(updates.address),
    }),
    ...(updates.notes !== undefined && { notes: cleanText(updates.notes) }),
    whatsapp: buildWhatsAppLink(nextPhone),
    updatedAt: nowIso(),
  };

  await dynamoDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedCustomer,
    }),
  );

  return {
    ok: true,
    customer: updatedCustomer,
  };
}
