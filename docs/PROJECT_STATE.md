# AI Pinball Lookup Backend — Project State

CURRENT DEVELOPMENT PHASE: Phase 18 Preparation — AI Technician Assistant

---

# Overview

This project is the backend infrastructure for **SwissPinball**.

The goal is to build a **machine intelligence platform for pinball technicians**.

The system manages:

- pinball machine identification
- structured machine metadata
- customer records
- physical machine ownership tracking
- service history tracking
- machine repair knowledge
- future AI technician assistance

The backend is **fully serverless and deployed on AWS**.

---

# Architecture

```
Client
   ↓
API Gateway (HTTP API)
   ↓
AWS Lambda (Node.js 24)
   ↓
Route Dispatcher
   ↓
Domain Routes
   ↓
Service Layer
   ↓
DynamoDB
```

External data sources:

- OPDB (Open Pinball Database)
- IPDB (manual lookup support)

---

# Technology Stack

## Backend

AWS Lambda — Node.js 24  
API Gateway — HTTP API  
DynamoDB — primary datastore

## Development

GitHub  
GitHub Actions (Lambda deployment)  
PowerShell API testing (`Invoke-RestMethod`)

---

# Lambda Structure

```
lambda/

handler.js

routes/
  customerRoutes.js
  instanceRoutes.js
  machineRoutes.js
  serviceRecordRoutes.js
  routeUtils.js

scripts/
  cacheService.js
  customerService.js
  instanceService.js
  metadataMapper.js
  metadataService.js
  mergeMachineData.js
  metadataKeys.js
  opdbService.js
  opdbDetailService.js
  ipdbManualService.js
  updateMetadataRecord.js
  serviceRecordService.js
```

---

# DynamoDB Tables

## machines_cache

Stores cached OPDB machine lookups.

Purpose:

- avoid repeated OPDB queries
- improve lookup speed
- reduce external API usage

Cache keys:

```
name:twilight zone
id:G4odr-mlzy7
```

---

## machine_metadata

Stores **SwissPinball machine knowledge and technician metadata**.

Examples:

- common machine failures
- repair notes
- diagnostic checklists
- recommended parts
- coil references
- manuals
- service tags

Example metadata fields:

```
commonIssues
repairNotes
internalNotes
coilReferences
switchNotes
lampNotes
displayNotes
mechanismNotes
diagnosticChecks
recommendedParts
manuals
parts
```

This table forms the **Machine Knowledge Base**.

---

## customers

Stores customer records.

Example fields:

```
customerId
name
email
phone
whatsapp
```

---

## pinball_machine_instances

Represents **real physical machines owned by customers**.

Relationship model:

```
customer → owns → machine instance → linked to machine model
```

---

## pinball_service_history

Stores service records.

Each record includes:

```
serviceId
instanceId
technician
serviceDate
status
notes
laborCost
partsUsed
```

---

# Routing System

The Lambda handler dispatches requests to modular route handlers.

Route order inside `handler.js`:

```
customerRoutes
serviceRecordRoutes
instanceRoutes
machineRoutes
```

Order matters to avoid route collisions.

---

# Machine Lookup System

Machine identification uses **OPDB**.

Workflow:

```
machine query
     ↓
opdbService (typeahead search)
     ↓
resolveMatch
     ↓
opdbDetailService
     ↓
normalizeMachine
     ↓
metadata enrichment
     ↓
cacheService
```

Results are cached in:

```
machines_cache
```

---

# Metadata Enrichment System

Every machine lookup is enriched with **SwissPinball metadata**.

Workflow:

```
machine lookup
      ↓
buildMachineId()
      ↓
getMetadata()
      ↓
createMetadataShell() if missing
      ↓
IPDB manual discovery
      ↓
saveMetadata()
      ↓
mergeMachineData()
```

This allows SwissPinball to attach **machine-specific repair knowledge** to OPDB machine models.

---

# Implemented API

## Machine API

```
GET /machine?q=
GET /machine?name=
GET /machine?id=
POST /machine
```

POST `/machine` supports metadata updates:

```
action: updateMetadata
```

Example payload:

```json
{
  "action": "updateMetadata",
  "machineId": "opdb:g4odr-mdxey",
  "repairNotes": ["Check EOS switch before replacing coil"]
}
```

---

## Customer API

```
POST /customers
GET /customers
GET /customers/{id}
PUT /customers/{id}
```

---

## Machine Instance API

```
POST /instances
GET /instances
GET /instances/{id}
PUT /instances/{id}
```

Represents a **real machine owned by a customer**.

---

## Service Record API

```
POST /service-records
GET /service-records/{serviceId}
PUT /service-records/{serviceId}
```

Allowed updates:

```
status
laborCost
notes
partsUsed
```

---

# Instance Service History

Retrieve service records for a machine instance.

```
GET /instances/{instanceId}/service-records
```

---

# Machine Timeline

Chronological repair history for a machine instance.

```
GET /instances/{instanceId}/history
```

Sorting priority:

1. `serviceDate`
2. `createdAt`

---

# Machine Knowledge Base (Phase 17)

The backend now supports structured **technician knowledge per machine model**.

Supported knowledge fields:

```
commonIssues
repairNotes
internalNotes
coilReferences
switchNotes
lampNotes
displayNotes
mechanismNotes
diagnosticChecks
recommendedParts
manuals
parts
```

Example:

```json
{
  "machineId": "opdb:g4odr-mdxey",
  "repairNotes": ["Check EOS switch before replacing coil"],
  "diagnosticChecks": ["Check EOS switch", "Inspect flipper link"],
  "recommendedParts": ["A-15405 flipper coil"]
}
```

This system forms the **SwissPinball Machine Knowledge Base**.

---

# Core System Capabilities

The backend currently supports:

```
machine identification
machine metadata enrichment
customer management
physical machine ownership tracking
service history tracking
repair timeline retrieval
machine repair knowledge storage
```

---

# Current Status

Backend is **stable and operational**.

Working endpoints:

```
/machine
/customers
/instances
/service-records
/instances/{id}/history
```

Completed phases:

```
Phase 15 — Instance Service History
Phase 16 — Machine Timeline
Phase 17 — Machine Knowledge Base
```

---

# Phase Roadmap

Upcoming development roadmap.

```
Phase 18 — AI Technician Assistant
Phase 19 — Machine Knowledge Index
Phase 20 — Technician Query Engine
Phase 21 — Service Analytics
Phase 22 — Machine Inventory System
Phase 23 — Technician Dashboard API
Phase 24 — Customer Portal API
Phase 25 — Parts Intelligence System
Phase 26 — Repair Recommendation Engine
Phase 27 — Predictive Maintenance
```

---

# Next Planned Development

## Phase 18 — AI Technician Assistant

Integrate **AWS Bedrock** to provide diagnostic guidance.

Example query:

```
Addams Family upper flipper weak
```

Possible AI response:

```
1 check EOS switch
2 inspect flipper link
3 check coil stop
4 test driver transistor
```

AI responses will be built using:

```
machine metadata
service history
machine model information
repair knowledge
```

---

# Long-Term Vision

SwissPinball becomes a **machine intelligence platform** where:

```
machines
owners
repair history
technical knowledge
AI diagnostics
```

are connected in a unified system.

This enables:

```
technician assistance
machine lifecycle tracking
intelligent repair guidance
collector inventory management
```

---

# CONTINUATION PROMPT FOR NEW CHAT

Paste the following into a new ChatGPT conversation to resume the project instantly:

```
You are continuing development of the SwissPinball backend.

The project is an AWS serverless system:

Client → API Gateway → Lambda (Node.js 24) → DynamoDB.

Current completed phases:

Phase 15 — Instance Service History
Phase 16 — Machine Timeline
Phase 17 — Machine Knowledge Base

The system already supports:

• machine lookup via OPDB
• machine metadata enrichment
• customer management
• machine instance tracking
• service history tracking
• repair timeline retrieval
• technician knowledge storage per machine model

Machine knowledge is stored in the `machine_metadata` DynamoDB table.

Supported metadata fields include:

commonIssues
repairNotes
internalNotes
coilReferences
switchNotes
lampNotes
displayNotes
mechanismNotes
diagnosticChecks
recommendedParts
manuals
parts

The next development phase is:

Phase 18 — AI Technician Assistant.

Goal:

Allow queries such as:

"Addams Family upper flipper weak"

and return a diagnostic checklist based on machine metadata and service history.

Continue development starting with the Phase 18 architecture.
```
