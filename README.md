# SwissPinball AI Backend

Serverless **Pinball Intelligence Platform** for SwissPinball.

This backend powers a knowledge system capable of:

- identifying pinball machines
- enriching machine metadata
- discovering manuals automatically
- managing customers
- linking machines to owners
- tracking service history
- assisting repairs with AI

Built using **AWS serverless architecture** for scalability, reliability, and low maintenance.

---

# Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [API Endpoint](#api-endpoint)
- [Machine Lookup API](#machine-lookup-api)
- [Machine Metadata System](#machine-metadata-system)
- [Customer API](#customer-api)
- [DynamoDB Tables](#dynamodb-tables)
- [Project Structure](#project-structure)
- [Machine Data Pipeline](#machine-data-pipeline)
- [Development Environment](#development-environment)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [Project Vision](#project-vision)

---

# Overview

The **SwissPinball AI Backend** is a serverless platform designed to store and manage technical knowledge about pinball machines and their owners.

Primary capabilities:

- Machine identification
- Machine metadata enrichment
- Repair knowledge storage
- Customer management
- Manual discovery
- Service tracking
- AI repair assistance (future)

The system acts as the **core intelligence layer** for the SwissPinball ecosystem.

---

# Architecture

```
Frontend (React UI)
        ↓
API Gateway (HTTP API)
        ↓
AWS Lambda (Node.js)
        ↓
DynamoDB
```

External data sources:

```
OPDB – Open Pinball Database
IPDB – Internet Pinball Database
```

Future AI integration:

```
Amazon Bedrock
Claude
```

---

# Technology Stack

| Component       | Technology        |
| --------------- | ----------------- |
| Backend Runtime | Node.js 24        |
| API Layer       | AWS API Gateway   |
| Compute         | AWS Lambda        |
| Database        | DynamoDB          |
| External Data   | OPDB / IPDB       |
| Future AI       | Amazon Bedrock    |
| Source Control  | GitHub            |
| Local Dev       | Windows + VS Code |

---

# API Endpoint

Base endpoint:

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

---

# Machine Lookup API

## Search Machines

Search OPDB using typeahead.

```
GET /machine?q={search}
```

Example:

```
GET /machine?q=twilight
```

Response:

```json
{
  "mode": "typeahead",
  "query": "twilight",
  "suggestions": [...]
}
```

---

## Lookup Machine by Name

```
GET /machine?name=Twilight%20Zone
```

Returns normalized machine data enriched with metadata.

---

## Lookup Machine by OPDB ID

```
GET /machine?id=GrXzD-MjBPX
```

---

## Update Machine Metadata

```
POST /machine
```

Body example:

```json
{
  "action": "updateMetadata",
  "machineId": "opdb:grxzd-mjbpx",
  "repairNotes": [],
  "commonIssues": []
}
```

---

# Machine Metadata System

Machine metadata extends OPDB data with technician knowledge.

Stored information:

```
manuals
repairNotes
commonIssues
parts
serviceTags
references
content
```

Metadata records are created automatically when a machine is first requested.

Example metadata key:

```
machineId: opdb:grxzd-mjbpx
```

---

# Customer API

Customer records allow SwissPinball to track machine owners.

## Create Customer

```
POST /customers
```

Example body:

```json
{
  "name": "Xavier",
  "phone": "+41792108272",
  "email": "x@example.com",
  "address": "Lausanne",
  "notes": "Indiana Jones machine"
}
```

---

## List Customers

```
GET /customers
```

---

## Get Customer

```
GET /customers/{customerId}
```

Example:

```
GET /customers/cust:704fbe8e-c602-40a4-aa56-56ae5d547be8
```

---

## Update Customer

```
PUT /customers/{customerId}
```

Example body:

```json
{
  "notes": "Indiana Jones machine - right flipper weak"
}
```

Behavior:

- Partial updates supported
- `createdAt` preserved
- `updatedAt` refreshed
- WhatsApp link regenerated if phone changes

---

# DynamoDB Tables

## Machine Cache

Table:

```
pinball_machines
```

Purpose:

Cache OPDB machine responses.

Primary key:

```
machineKey
```

Example keys:

```
id:GrXzD-MjBPX
name:twilight zone
```

---

## Machine Metadata

Table:

```
pinball_machine_metadata
```

Primary key:

```
machineId
```

Example:

```
opdb:grxzd-mjbpx
```

Stored data:

```
manuals
repairNotes
commonIssues
parts
serviceTags
references
content
```

---

## Customers

Table:

```
pinball_customers
```

Schema:

```
customerId
name
phone
whatsapp
email
address
notes
createdAt
updatedAt
```

Example record:

```json
{
  "customerId": "cust:704fbe8e-c602-40a4-aa56-56ae5d547be8",
  "name": "Xavier",
  "phone": "+41792108272",
  "whatsapp": "https://wa.me/41792108272",
  "email": "x@example.com",
  "address": "Lausanne",
  "notes": "Indiana Jones machine",
  "createdAt": "2026-03-11T10:41:28.233Z",
  "updatedAt": "2026-03-11T10:41:28.233Z"
}
```

---

# Project Structure

```
lambda/
│
├── handler.js
│
└── scripts/
    ├── opdbService.js
    ├── opdbDetailService.js
    ├── normalizeMachine.js
    ├── resolveMatch.js
    ├── cacheService.js
    ├── dynamoClient.js
    ├── metadataService.js
    ├── metadataMapper.js
    ├── metadataKeys.js
    ├── mergeMachineData.js
    ├── updateMetadataRecord.js
    ├── ipdbManualService.js
    └── customerService.js
```

---

# Machine Data Pipeline

Machine lookup process:

```
User Request
      ↓
Cache lookup (DynamoDB)
      ↓
OPDB search
      ↓
Machine detail lookup
      ↓
Normalization
      ↓
Metadata enrichment
      ↓
IPDB manual discovery
      ↓
Merged machine response
```

---

# Development Environment

Runtime:

```
Node.js 24
```

Deployment stack:

```
AWS Lambda
API Gateway
DynamoDB
```

Local development tools:

```
Windows
VS Code
PowerShell
GitHub
```

---

# Local Development

Install dependencies:

```
npm install
```

Run tests:

```
node test-opdb.js
```

Check syntax:

```
node --check handler.js
```

---

# Deployment

Deploy through GitHub or AWS CLI.

Example Lambda deployment command:

```
aws lambda update-function-code \
  --function-name ai-pinball-lookup \
  --zip-file fileb://deployment.zip
```

---

# Future Roadmap

## Phase 14 — Machine Instances

Table:

```
pinball_machine_instances
```

Purpose:

Link customers to physical machines.

Example:

```
Customer → Xavier
Machine → Indiana Jones
Location → Lausanne
Issue → Weak flipper
```

---

## Phase 15 — Service History

Table:

```
pinball_service_history
```

Fields:

```
instanceId
serviceDate
diagnosis
workPerformed
partsUsed
laborCost
```

---

## Phase 16 — AI Technician Assistant

Integration:

```
Amazon Bedrock
Claude
```

Capabilities:

```
fault diagnosis
repair guidance
manual summarization
parts lookup
```

---

# Project Vision

Create a **SwissPinball machine intelligence and service platform** capable of:

- identifying machines instantly
- storing technician knowledge
- tracking machine ownership
- recording repair history
- providing AI-assisted diagnostics

The long-term goal is to build a **complete repair intelligence system for pinball technicians**.
