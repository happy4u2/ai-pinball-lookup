# AI Pinball Lookup — SwissPinball Backend

Serverless backend powering the **SwissPinball machine intelligence and service platform**.

This system provides:

- Pinball machine lookup
- Machine metadata enrichment
- Customer database
- Machine documentation discovery
- Foundation for repair intelligence and service tracking

Built using **AWS serverless architecture**.

---

# Architecture

```
React UI
   ↓
API Gateway (HTTP API)
   ↓
AWS Lambda (Node.js 24)
   ↓
DynamoDB
```

External data sources:

```
OPDB – Open Pinball Database
IPDB – Internet Pinball Database
```

Future enrichment layer:

```
Amazon Bedrock
Claude AI
```

---

# API Base Endpoint

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

---

# Implemented Features

## Machine Lookup

### Search Machines

```
GET /machine?q=twilight
```

Example:

```
GET /machine?q=twilight
```

Response:

```
mode: typeahead
suggestions: [...]
```

---

### Machine Lookup by Name

```
GET /machine?name=Twilight%20Zone
```

Returns full normalized machine information.

---

### Machine Lookup by OPDB ID

```
GET /machine?id=GrXzD-MjBPX
```

---

### Machine Metadata Update

```
POST /machine
```

Body:

```json
{
  "action": "updateMetadata",
  "machineId": "opdb:grxzd-mjbpx",
  "repairNotes": [],
  "commonIssues": []
}
```

---

# Machine Data Pipeline

Machine request flow:

```
Request
   ↓
Cache lookup (DynamoDB)
   ↓
OPDB search / detail lookup
   ↓
Machine normalization
   ↓
Metadata enrichment
   ↓
IPDB manual discovery
   ↓
Merged machine response
```

---

# Machine Metadata Enrichment

When a machine is first requested:

1. Metadata shell is created

```
createMetadataShell()
```

2. Metadata stored in DynamoDB

3. IPDB reference saved

4. Manual discovery attempted

```
discoverIpdbManuals()
```

5. Machine + metadata merged

```
mergeMachineData()
```

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

Examples:

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

Stored information:

```
manuals
commonIssues
repairNotes
parts
serviceTags
references
content
```

---

# Customer Database (Phase 13)

New DynamoDB table:

```
pinball_customers
```

Purpose:

Store SwissPinball customers.

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

# Customer API

## Create Customer

```
POST /customers
```

Body:

```json
{
  "name": "Xavier",
  "phone": "+41792108272",
  "email": "x@example.com",
  "address": "Lausanne",
  "notes": "Indiana Jones machine"
}
```

Response:

```json
{
  "ok": true,
  "customer": {...}
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

Example:

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

# Lambda Project Structure

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

# DynamoDB Client

Shared DynamoDB client:

```
scripts/dynamoClient.js
```

Export:

```javascript
export const dynamoDocClient;
```

Used by:

```
cacheService
metadataService
customerService
```

---

# Response Format

All API responses follow:

```json
{
  "ok": true,
  "data": {...}
}
```

Error example:

```json
{
  "error": "Machine not found"
}
```

---

# Next Development Phases

## Phase 14 — Machine Instances

Introduce table:

```
pinball_machine_instances
```

Purpose:

Link customers to physical machines.

Example:

```
Customer → Xavier
Machine Model → Indiana Jones
Location → Lausanne
Issue → Weak flipper
```

---

## Phase 15 — Service History

Track repairs and service visits.

Table:

```
pinball_service_history
```

Example fields:

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

Integrate:

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

# Development Environment

Runtime:

```
Node.js 24
```

Deployment:

```
AWS Lambda
API Gateway HTTP API
DynamoDB
```

Local development:

```
Windows
VS Code
PowerShell
GitHub
```

---

# Project Goal

Create a **SwissPinball machine intelligence and service platform** capable of:

- identifying machines
- storing technician knowledge
- tracking service history
- managing customers
- assisting repairs with AI
