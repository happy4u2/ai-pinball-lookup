# AI Pinball Lookup

Serverless pinball machine lookup and technical knowledge API built on AWS.

This project provides intelligent machine identification, variant disambiguation, and structured pinball machine data powered by the **Open Pinball Database (OPDB)** and enhanced with **SwissPinball technical metadata stored in DynamoDB**.

The system is designed to evolve into a **machine intelligence platform for technicians and collectors**, capable of storing manuals, repair knowledge, service history, and customer machine records.

---

## Table of Contents

- [Overview](#overview)
- [Project Goals](#project-goals)
- [Architecture](#architecture)
- [Core Data Sources](#core-data-sources)
- [API Endpoint](#api-endpoint)
- [API Usage](#api-usage)
  - [Typeahead Search](#typeahead-search)
  - [Machine Lookup by Name](#machine-lookup-by-name)
  - [Machine Lookup by OPDB ID](#machine-lookup-by-opdb-id)
  - [Update Machine Metadata](#update-machine-metadata)
- [Backend Structure](#backend-structure)
- [DynamoDB Tables](#dynamodb-tables)
  - [Machine Cache](#machine-cache)
  - [Machine Metadata](#machine-metadata)
- [Machine Metadata Model](#machine-metadata-model)
- [Cache Strategy](#cache-strategy)
- [Match Resolution System](#match-resolution-system)
- [Example Machine Families](#example-machine-families)
- [Manual Discovery System](#manual-discovery-system-planned)
- [AI Technology Stack](#ai-technology-stack)
- [Frontend](#frontend)
- [Technologies](#technologies)
- [Current Project Phase](#current-project-phase)
- [Upcoming Phases](#upcoming-phases)
- [Future Capabilities](#future-capabilities)
- [Repository](#repository)
- [Vision](#vision)

---

## Overview

AI Pinball Lookup is a serverless backend for identifying pinball machines, resolving machine variants, and storing structured technical metadata.

It combines:

- **OPDB** for authoritative machine reference data
- **DynamoDB** for persistent SwissPinball machine metadata
- **AWS Lambda** for API execution
- **API Gateway** for public access
- **Amazon Bedrock** for future AI enrichment workflows

The long-term aim is to create a practical machine knowledge system for technicians, collectors, and service operations.

---

## Project Goals

The long-term goal is to build a **pinball machine intelligence system**.

The system should be able to:

- identify pinball machines
- return structured machine data
- store machine-specific knowledge
- manage manuals and documentation
- store repair knowledge and common issues
- manage customer machines and service history
- assist technicians using AI

---

## Architecture

```
User
   │
   ▼
React UI (Vite + Tailwind)
   │
   ▼
API Gateway
   │
   ▼
AWS Lambda (Node.js 24)
   │
   ├── DynamoDB Machine Cache
   │
   ├── DynamoDB Machine Metadata
   │
   ├── OPDB API
   │
   └── AI Services (Amazon Bedrock)
```

---

## Core Data Sources

### OPDB (Open Pinball Database)

Primary machine reference source.

Provides:

- machine name
- manufacturer
- year
- display type
- player count
- IPDB reference

### SwissPinball Metadata

Stored in DynamoDB.

Used for:

- manuals
- repair notes
- common issues
- service tags
- parts references
- technical descriptions

This becomes the **persistent machine knowledge layer**.

---

## API Endpoint

Base URL

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

---

## API Usage

### Typeahead Search

Returns machine suggestions while typing.

```
GET /machine?q=jurassic
```

Example response

```json
{
  "mode": "typeahead",
  "query": "jurassic",
  "suggestions": [
    {
      "id": "G4ZVB-MJ5lE",
      "name": "Jurassic Park",
      "supplementary": "Data East, 1993",
      "display": "dmd"
    }
  ]
}
```

---

### Machine Lookup by Name

```
GET /machine?name=Twilight%20Zone
```

Possible responses:

#### Result

```json
{
  "mode": "result",
  "source": "opdb-machine",
  "selectedMatch": {
    "id": "GrXzD-MjBPX",
    "name": "Twilight Zone",
    "supplementary": "Bally, 1993"
  },
  "result": {}
}
```

#### Disambiguation

Returned when multiple machine variants exist.

```json
{
  "mode": "disambiguation",
  "query": "Jurassic Park",
  "matches": [
    {
      "name": "Jurassic Park",
      "supplementary": "Data East, 1993"
    },
    {
      "name": "Jurassic Park (Pro)",
      "supplementary": "Stern, 2019"
    }
  ]
}
```

---

### Machine Lookup by OPDB ID

```
GET /machine?id=GrXzD-MjBPX
```

---

### Update Machine Metadata

```
POST /machine
```

Used to update machine technical metadata.

Example request

```json
{
  "action": "updateMetadata",
  "machineId": "opdb:grxzd-mjbpx",
  "commonIssues": ["Clock board faults", "Powerball / gumball handling issues"],
  "repairNotes": ["Check clock board voltages first"],
  "serviceTags": ["wpc", "widebody", "clock"]
}
```

Example response

```json
{
  "ok": true,
  "machineId": "opdb:grxzd-mjbpx"
}
```

---

## Backend Structure

```
lambda/
│
├── handler.js
│
└── scripts/
    ├── opdbService.js
    ├── opdbDetailService.js
    ├── resolveMatch.js
    ├── normalizeMachine.js
    ├── cacheService.js
    ├── dynamoClient.js
    ├── metadataService.js
    ├── metadataMapper.js
    ├── metadataKeys.js
    ├── mergeMachineData.js
    ├── updateMetadataRecord.js
    ├── ipdbManualService.js
    └── aiManualClassifier.js (planned)
```

---

## DynamoDB Tables

### Machine Cache

```
pinball_machines
```

Used to cache OPDB responses.

Primary key

```
machineKey
```

Example keys

```
id:G4ZVB-MJ5lE
name:twilight zone
```

### Machine Metadata

```
pinball_machine_metadata
```

Stores persistent machine knowledge.

Primary key

```
machineId
```

Example

```
opdb:grxzd-mjbpx
```

---

## Machine Metadata Model

Example record

```json
{
  "machineId": "opdb:grxzd-mjbpx",
  "name": "Twilight Zone",
  "manufacturer": "Bally",
  "normalizedName": "twilight zone",
  "references": {
    "opdbId": "GrXzD-MjBPX",
    "ipdbId": 2684,
    "ipdbMachineUrl": "https://www.ipdb.org/machine.cgi?id=2684"
  },
  "manuals": [],
  "manualCandidates": [],
  "commonIssues": [],
  "repairNotes": [],
  "parts": [],
  "serviceTags": [],
  "content": {
    "shortDescription": "",
    "longDescription": "",
    "keywords": []
  },
  "status": "active",
  "schemaVersion": 2,
  "createdAt": "",
  "updatedAt": ""
}
```

---

## Cache Strategy

| Query Type        | Cached |
| ----------------- | ------ |
| Typeahead         | No     |
| Ambiguous search  | No     |
| Exact machine ID  | Yes    |
| Exact title match | Yes    |

This prevents disambiguation results from being cached incorrectly.

---

## Match Resolution System

The resolver determines whether to:

- return a single machine
- return a disambiguation list
- return not found

Scoring factors include:

- normalized title match
- base title family match
- edition keywords
- year weighting
- variant penalties

---

## Example Machine Families

```
Addams Family
 ├─ The Addams Family (1992)
 ├─ The Addams Family Gold
 └─ The Addams Family Special Collectors Edition

Jurassic Park
 ├─ Jurassic Park (1993)
 ├─ The Lost World Jurassic Park
 ├─ Jurassic Park (Pro)
 ├─ Jurassic Park (Premium)
 └─ Jurassic Park (LE)
```

---

## Manual Discovery System (Planned)

The system will support **automatic manual discovery and AI-assisted classification**.

Manual ingestion follows three stages:

1. Discovery
2. AI Classification
3. Verification

---

## AI Technology Stack

```
AI Platform: Amazon Bedrock
Model: Claude
API: Converse API
Runtime: AWS Lambda Node.js
Storage: DynamoDB
```

---

## Frontend

```
React
Vite
TailwindCSS
```

Local development

```
npm install
npm run dev
```

Local UI

```
http://localhost:5173
```

---

## Technologies

Backend

```
AWS Lambda (Node.js 24)
API Gateway
DynamoDB
AWS SDK v3
Amazon Bedrock
```

Frontend

```
React
Vite
TailwindCSS
```

External Data

```
OPDB
IPDB
```

---

## Current Project Phase

**Phase 12**

Working features

- OPDB machine lookup
- machine detail retrieval
- intelligent match resolution
- disambiguation system
- DynamoDB caching
- persistent machine metadata
- machine metadata editing API
- IPDB reference integration

---

## Upcoming Phases

Phase 13  
Customer database

Phase 14  
Customer machine instances

Phase 15  
Service history and repair logs

Phase 16  
AI technician assistant

---

## Future Capabilities

Machine

```
Bally Corvette
```

Problem

```
weak flipper
```

AI could return

```
likely causes
coil specifications
EOS switch tests
replacement parts
repair procedures
```

---

## Repository

```
ai-pinball-lookup
```

Author

```
SwissPinball
```

---

## Vision

The long-term goal is to build the **most useful pinball machine knowledge system for technicians and collectors**, combining:

- machine data
- manuals
- parts references
- repair knowledge
- customer machines
- service history
- AI-assisted diagnostics

into a single platform.
