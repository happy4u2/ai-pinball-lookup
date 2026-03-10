# AI Pinball Lookup

Serverless pinball machine lookup API built on AWS.

This project provides intelligent search, disambiguation, and normalized machine data powered by the **Open Pinball Database (OPDB)** and enhanced with **SwissPinball machine metadata stored in DynamoDB**.

The system is designed to evolve into a **machine knowledge database** capable of storing manuals, repair notes, parts, and AI-assisted diagnostics.

---

# Project Goals

The long-term goal is to build a **machine intelligence layer for pinball machines**.

The system should be able to:

- identify pinball machines
- return structured machine data
- store machine-specific knowledge
- manage manuals and documentation
- assist with repair diagnostics using AI

---

# Architecture

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
   ├── DynamoDB Cache
   │
   ├── Machine Metadata Database
   │
   ├── OPDB API
   │
   └── AI Services (Amazon Bedrock)
```

---

# Core Data Sources

## OPDB (Open Pinball Database)

Primary structured machine data source.

Provides:

- machine name
- manufacturer
- year
- display type
- player count
- IPDB reference

---

## SwissPinball Metadata

Stored in DynamoDB.

Used for:

- manuals
- repair notes
- common issues
- service tags
- parts
- content descriptions

This becomes the **persistent machine knowledge layer**.

---

# API Endpoint

Base URL

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

---

# API Usage

## Typeahead Search

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

## Machine Lookup by Name

```
GET /machine?name=Twilight%20Zone
```

Possible responses:

### Result

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

---

### Disambiguation

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

## Machine Lookup by OPDB ID

```
GET /machine?id=GrXzD-MjBPX
```

Example response

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

---

# Backend Structure

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
    ├── ipdbManualService.js
    └── aiManualClassifier.js (planned)
```

---

# DynamoDB Tables

## Machine Cache

```
pinball_machines
```

Used to cache OPDB responses.

Primary key:

```
machineKey
```

Example keys

```
id:G4ZVB-MJ5lE
name:twilight zone
```

---

## Machine Metadata

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

# Machine Metadata Model

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

  "discovery": {
    "lastManualDiscoveryAt": null,
    "lastManualDiscoveryStatus": "not_attempted"
  },

  "status": "active",
  "schemaVersion": 2,

  "createdAt": "",
  "updatedAt": ""
}
```

---

# Cache Strategy

| Query Type        | Cached |
| ----------------- | ------ |
| Typeahead         | No     |
| Ambiguous search  | No     |
| Exact machine ID  | Yes    |
| Exact title match | Yes    |

This prevents disambiguation results from being cached incorrectly.

---

# Match Resolution System

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

# Example Machine Families

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

# Manual Discovery System (Planned)

The system will support **automatic manual discovery and AI-assisted classification**.

Manual ingestion follows a three-layer model.

---

## 1 Discovery

The system gathers candidate links from multiple sources.

Example sources:

- IPDB
- manufacturer documentation
- community resources
- curated document repositories

These are stored as **manualCandidates**.

---

## 2 AI Classification

Candidates are analyzed using **Amazon Bedrock**.

AI determines:

- document type
- relevance
- confidence score

Example output

```json
{
  "url": "https://example.com/tz-manual.pdf",
  "type": "manual",
  "relevant": true,
  "confidence": 0.94
}
```

---

## 3 Verification

Manuals can then be approved and moved to the **manuals** list.

Example

```json
{
  "title": "Twilight Zone Operations Manual",
  "url": "https://example.com/tz-manual.pdf",
  "type": "manual",
  "verified": true
}
```

---

# AI Technology Stack

The project will use **Amazon Bedrock**.

```
AI Platform: Amazon Bedrock
Model: Claude
API: Converse API
Runtime: AWS Lambda Node.js
Storage: DynamoDB
```

AI will assist with:

- manual candidate classification
- document type detection
- relevance scoring
- duplicate detection
- manual summarization
- repair knowledge extraction

---

# Frontend

Built with

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

# Technologies

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
OPDB (Open Pinball Database)
IPDB (Internet Pinball Database)
```

---

# Current Project Phase

Phase 11  
Machine metadata foundation

Working features

- OPDB machine lookup
- machine detail retrieval
- intelligent match resolution
- disambiguation system
- DynamoDB caching
- persistent machine metadata
- IPDB reference integration

---

# Upcoming Phases

Phase 12  
Manual discovery pipeline

Phase 13  
AI manual classification

Phase 14  
Manual verification workflow

Phase 15  
Machine repair knowledge extraction

---

# Future Capabilities

Example

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

# Repository

GitHub repository

```
ai-pinball-lookup
```

Author

```
SwissPinball
```

---

# Vision

The long-term goal is to build the **most useful pinball machine knowledge system for technicians and collectors**.

A system capable of combining:

- machine data
- manuals
- parts
- repair knowledge
- AI-assisted diagnostics

into a single searchable platform.
