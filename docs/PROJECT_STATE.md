# AI Pinball Lookup Backend — Project State

## Overview

This project is the backend infrastructure for **SwissPinball**.

The goal is to build a **machine intelligence platform for pinball technicians**.
The system manages:

- pinball machine identification
- structured machine metadata
- customer records
- physical machine ownership tracking
- service history tracking
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

Stores **SwissPinball technical metadata**.

Examples:

- board notes
- technician repair notes
- parts references
- manuals

---

## customers

Stores customer records.

Example fields:

- customerId
- name
- email
- phone
- whatsapp

---

## pinball_machine_instances

Represents **real physical machines owned by customers**.

Example:

```
customer → owns → machine instance → linked to machine model
```

---

## pinball_service_history

Stores service records.

Each record includes:

- serviceId
- instanceId
- technician
- serviceDate
- status
- notes
- laborCost
- partsUsed

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
cacheService
```

Results are cached in:

```
machines_cache
```

---

# Implemented API

## Machine API

```
GET /machine?q=
GET /machine?name=
GET /machine?id=

POST /machine
```

POST is used to update machine metadata.

---

## Customer API

Create and manage customers.

```
POST /customers
GET /customers
GET /customers/{id}
PUT /customers/{id}
```

---

## Machine Instance API

Represents **a real pinball machine owned by someone**.

```
POST /instances
GET /instances
GET /instances/{id}
PUT /instances/{id}
```

---

## Service Record API

Tracks repairs and maintenance.

```
POST /service-records
GET /service-records/{serviceId}
PUT /service-records/{serviceId}
```

Allowed update fields:

- status
- laborCost
- notes
- partsUsed

---

# Instance Service History

Retrieve service records for a machine instance.

```
GET /instances/{instanceId}/service-records
```

Returns raw service records.

---

# Phase 16 Feature — Machine Timeline

Endpoint:

```
GET /instances/{instanceId}/history
```

Returns chronological repair history.

Example:

```json
{
  "ok": true,
  "instanceId": "ins:test-001",
  "count": 2,
  "history": [
    {
      "serviceId": "srv:123",
      "status": "completed",
      "notes": "Flipper rebuild"
    },
    {
      "serviceId": "srv:456",
      "status": "completed",
      "notes": "GI LED upgrade"
    }
  ]
}
```

Sorting priority:

1. `serviceDate`
2. `createdAt`

---

# Core System Capabilities

The backend currently supports:

- machine identification
- machine metadata enrichment
- customer management
- physical machine ownership tracking
- service history tracking
- repair timeline retrieval

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
```

---

# Next Planned Development

## Phase 17 — Machine Knowledge Base

Extend `machine_metadata`.

Add technician intelligence:

- common failures
- repair tips
- recommended parts
- board notes
- manual links

Example:

```json
{
  "machineId": "G4odr-mlzy7",
  "commonFailures": [
    "flipper opto failure",
    "magnet driver transistor burnout"
  ],
  "repairTips": ["check EOS switch first"]
}
```

---

## Phase 18 — AI Technician Assistant

Integrate **AWS Bedrock**.

Capabilities:

- repair suggestions
- diagnostic guidance
- parts recommendations

Example query:

```
Addams Family upper flipper weak
```

Possible AI response:

```
check EOS switch
check coil stop
check flipper link
check driver transistor
```

---

## Phase 19 — SwissPinball Platform API

Future platform layer:

- customer portal
- technician dashboard
- repair reports
- machine inventory
- service analytics

---

# Long-Term Vision

SwissPinball becomes a **machine intelligence platform** where:

- machines
- owners
- repair history
- technical knowledge
- AI diagnostics

are connected in a unified system.

This enables:

- technician assistance
- machine lifecycle tracking
- intelligent repair guidance
- collector inventory management
