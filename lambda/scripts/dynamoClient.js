/*
========================================================
DynamoDB Client
Shared DynamoDB DocumentClient used across services.
========================================================
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/*
Base DynamoDB client
*/
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-central-1",
});

/*
Document client wrapper
Handles JSON marshalling automatically
*/
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
