import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";
import crypto from "crypto";

const TABLE_NAME = process.env.CUSTOMERS_TABLE_NAME || "pinball_customers";

function buildWhatsAppLink(phone) {
  if (!phone) return null;

  const cleaned = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}`;
}

export async function createCustomer(data) {
  const now = new Date().toISOString();

  const customerId = `cust:${crypto.randomUUID()}`;

  const item = {
    customerId,
    name: data.name || null,
    phone: data.phone || null,
    whatsapp: buildWhatsAppLink(data.phone),
    email: data.email || null,
    address: data.address || null,
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

export async function getCustomer(customerId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { customerId },
    }),
  );

  return result.Item || null;
}

export async function listCustomers() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  return result.Items || [];
}
