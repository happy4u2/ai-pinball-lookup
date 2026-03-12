## Project Documentation

Project state and architecture documentation:

- [Project State](docs/PROJECT_STATE.md)

# AI Pinball Lookup

Serverless backend powering the **SwissPinball Machine Intelligence Platform**.

This system provides structured machine information, customer management, machine ownership tracking, and service history for pinball machines.

The backend is built using **AWS Lambda, API Gateway, and DynamoDB**.

---

# Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Machine Lookup API](#machine-lookup-api)
- [Customer API](#customer-api)
- [Machine Instance API](#machine-instance-api)
- [Service History API](#service-history-api)
- [Metadata System](#metadata-system)
- [Caching Strategy](#caching-strategy)
- [Development](#development)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Future Roadmap](#future-roadmap)

---

# Overview

The **AI Pinball Lookup backend** is a serverless platform designed to power the SwissPinball ecosystem.

It combines:

- Open Pinball Database (OPDB) machine data
- SwissPinball internal metadata
- Machine ownership tracking
- Technician service records

The system allows technicians and collectors to:

- identify machines
- retrieve structured technical information
- track machines owned by customers
- record service history
- enrich machine metadata

---

# Architecture

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

External data sources:

- OPDB (Open Pinball Database)
- IPDB (manual discovery)

---

# Project Structure

```
lambda/

handler.js

routes/
├── customerRoutes.js
├── instanceRoutes.js
├── serviceRecordRoutes.js
├── machineRoutes.js
└── routeUtils.js

scripts/
├── opdbService.js
├── opdbDetailService.js
├── cacheService.js
├── metadataService.js
├── metadataMapper.js
├── mergeMachineData.js
├── metadataKeys.js
├── ipdbManualService.js
├── updateMetadataRecord.js
├── customerService.js
├── instanceService.js
└── serviceRecordService.js
```

Design principle:

Route Layer  
↓  
Service Layer  
↓  
Database

This keeps the **Lambda handler small and maintainable**.

---

# API Overview

| Domain            | Endpoint           |
| ----------------- | ------------------ |
| Machine lookup    | `/machine`         |
| Customers         | `/customers`       |
| Machine instances | `/instances`       |
| Service records   | `/service-records` |

---

# Machine Lookup API

Search machines using OPDB.

## Typeahead Search

GET /machine?q=twilight

Example response:

```
{
  "mode": "typeahead",
  "query": "twilight",
  "suggestions": [...]
}
```

---

## Machine Lookup by Name

GET /machine?name=Twilight Zone

Returns normalized machine data.

---

## Machine Lookup by ID

GET /machine?id=GrXzD-MjBPX

---

## Metadata Update

POST /machine

Example:

```
{
  "action": "updateMetadata",
  "machineId": "opdb:grxzd-mjbpx",
  "notes": "Prototype run"
}
```

---

# Customer API

Create and manage customers.

## Create Customer

POST /customers

Example:

```
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## List Customers

GET /customers

---

## Get Customer

GET /customers/{id}

---

## Update Customer

PUT /customers/{id}

---

# Machine Instance API

Represents **real machines owned by customers**.

Example:

Addams Family owned by John Doe.

---

## Create Instance

POST /instances

Example:

```
{
  "customerId": "cust:123",
  "machineId": "opdb:grxzd-mjbpx",
  "location": "Geneva"
}
```

---

## List Instances

GET /instances

Optional filters:

GET /instances?customerId=cust:123  
GET /instances?machineId=opdb:abc

---

## Get Instance

GET /instances/{id}

---

## Update Instance

PUT /instances/{id}

---

# Service History API

Tracks repair history for machines.

## Create Service Record

POST /service-records

Example:

```
{
  "instanceId": "inst:abc",
  "serviceDate": "2026-03-12",
  "technician": "David Haughton",
  "serviceType": "repair",
  "diagnosis": "Left flipper weak",
  "workPerformed": "Rebuilt flipper",
  "partsUsed": ["plunger","coil stop"],
  "laborCost": 125
}
```

---

## Get Service Record

GET /service-records/{serviceId}

---

## List Service Records for Machine

GET /instances/{id}/service-records

---

# Metadata System

Metadata stores additional machine information beyond OPDB.

Example metadata fields:

- manuals
- technical notes
- repair tips
- IPDB references

If metadata does not exist, a **metadata shell** is automatically created.

---

# Caching Strategy

Machine lookups are cached to reduce OPDB requests.

Cache keys:

```
name:twilight zone
id:GrXzD-MjBPX
```

Cache storage:

DynamoDB

---

# Development

Local test example:

```
node test-opdb.js
```

Example API test:

```
GET /machine?q=twilight
```

---

# Deployment

Deployment is handled automatically using **GitHub Actions**.

Pipeline:

GitHub Push  
↓  
GitHub Actions  
↓  
Zip Lambda  
↓  
Deploy to AWS

Manual deployment:

```
aws lambda update-function-code \
--function-name ai-pinball-lookup \
--zip-file fileb://deployment.zip \
--region eu-central-1
```

---

# Git Workflow

Commit and push changes:

```
git add README.md
git commit -m "Update README with modular architecture and service history API"
git push
```

---

# Future Roadmap

### Service Record Editing

PUT /service-records/{id}

### Service Timeline

GET /instances/{id}/history

### Technician AI Assistant

Future AI integration using AWS Bedrock.

Capabilities:

- repair suggestions
- troubleshooting assistance
- machine diagnostics

---

# Author

SwissPinball  
Pinball restoration and machine intelligence platform.
