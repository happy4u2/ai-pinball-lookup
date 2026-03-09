# AI Pinball Lookup

Serverless backend that returns structured pinball machine information using the **Open Pinball Database (OPDB)**.

The system performs machine lookup, normalizes machine data, and caches results in **AWS DynamoDB** to improve performance and reduce external API calls.

---

# Project Status

Current Phase: **Phase 8 — Public API via API Gateway**

Working features:

- OPDB typeahead machine search
- OPDB machine detail lookup
- normalized machine response format
- DynamoDB caching layer
- intelligent match selection (prefer original machines over variants)
- local development test harness
- deployed AWS Lambda backend
- public HTTP API via API Gateway

---

# System Architecture

```text
Client
  ↓
API Gateway
  ↓
AWS Lambda
  ↓
DynamoDB Cache
   ├─ HIT  → return cached machine
   └─ MISS
        ↓
     OPDB Typeahead Search
        ↓
     Fallback Title Search
        ↓
     Best Match Selection
        ↓
     OPDB Machine Detail Lookup
        ↓
     Normalize Machine Data
        ↓
     Save to DynamoDB
        ↓
     Return JSON Response
```

---

# Public API

### Base URL

```text
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

### Route

```text
GET /machine
```

### Example Request

```text
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod/machine?name=Addams%20Family
```

### Supported Query Parameters

| Parameter | Description |
|----------|-------------|
| name | Machine name |
| machineName | Alternative parameter |

### Example Response

```json
{
  "source": "opdb-machine",
  "query": "Addams Family",
  "selectedMatch": {
    "id": "G4ODR-MDXEy",
    "text": "The Addams Family (Bally, 1992)"
  },
  "result": {
    "opdb_id": "G4ODR-MDXEy",
    "name": "The Addams Family",
    "shortname": "TAF",
    "manufacturer": "Bally",
    "manufacturer_full_name": "Bally Manufacturing Co.",
    "manufacture_date": "1992-01-03",
    "type": "ss",
    "display": "dmd",
    "player_count": 4,
    "features": [],
    "keywords": ["movie"],
    "ipdb_id": 20,
    "description": "",
    "primary_image": "https://img.opdb.org/85401531-c087-4f7d-9484-4e867418560a-large.jpg"
  },
  "cache": {
    "hit": true
  }
}
```

---

# Project Structure

```text
ai-pinball-lookup
│
├─ lambda/
│  ├─ handler.js
│  ├─ package.json
│  │
│  └─ scripts/
│     ├─ opdbService.js
│     ├─ opdbDetailService.js
│     ├─ normalizeMachine.js
│     ├─ dynamoClient.js
│     ├─ cacheService.js
│     └─ selectBestMatch.js
│
├─ tests/
│
├─ test-event.json
├─ test-handler.js
├─ test-opdb.js
├─ test-detail.js
│
├─ .env
├─ .gitignore
└─ README.md
```

---

# Environment Variables

The Lambda function requires:

```text
OPDB_API_TOKEN
MACHINE_TABLE_NAME
AWS_REGION
```

Example:

```text
OPDB_API_TOKEN=your_opdb_token
MACHINE_TABLE_NAME=pinball_machines
AWS_REGION=eu-central-1
```

---

# DynamoDB Table

Table name:

```text
pinball_machines
```

Partition key:

```text
machineKey (String)
```

Example stored item:

```text
machineKey: medieval madness
query: Medieval Madness
cachedAt: 2026-03-09T11:38:13.344Z
result: { normalized machine data }
```

---

# Local Development

### Install dependencies

```text
npm install
```

### Create `.env`

```text
OPDB_API_TOKEN=your_token
MACHINE_TABLE_NAME=pinball_machines
AWS_REGION=eu-central-1
```

### Run local test

```text
node test-detail.js
```

---

# Deployment

Deployment is handled through **GitHub Actions**.

Typical workflow:

```text
git add .
git commit -m "update"
git push
```

GitHub Actions deploys the Lambda automatically.

---

# Development Phases

## Phase 1 — Project Bootstrap

Initial project setup:

- GitHub repository created
- Lambda project structure created
- local Node.js project initialized

## Phase 2 — Lambda Handler

Basic Lambda entry point:

- event parsing
- JSON response structure
- error handling

## Phase 3 — OPDB Typeahead Search

Machine name search using OPDB typeahead:

- query machine name
- return search candidates

## Phase 4 — OPDB Machine Detail Lookup

Expanded lookup flow:

- search OPDB
- select best matching machine
- fetch full machine detail record

## Phase 5 — Normalized Response Format

Added normalized machine output:

- cleaner JSON structure
- reduced raw OPDB payload
- API-friendly response format

## Phase 6 — DynamoDB Cache (Local)

Added local cache support:

- cache normalized machine data
- store lookups in DynamoDB
- return cached records on repeated local requests

## Phase 7 — DynamoDB Cache Deployed to Lambda

Extended cache support to the deployed Lambda:

- Lambda reads from DynamoDB
- Lambda saves new machine lookups to DynamoDB
- cloud cache hit/miss flow confirmed

## Phase 8 — API Gateway Public HTTP API

Added public API access through AWS API Gateway:

- HTTP API created
- Lambda integrated with API Gateway
- public route `GET /machine`
- query parameter support with `name` and `machineName`
- live endpoint available for browser and HTTP client access

## Phase 9 — Planned: Machine Alias Support

Planned shorthand support:

```text
tz  → Twilight Zone
taf → Addams Family
mm  → Medieval Madness
afm → Attack from Mars
```

## Phase 10 — Planned: AI Machine Summaries

Planned AI enrichment using **Amazon Bedrock**.

## Phase 11 — Planned: Pinball Repair Knowledge Assistant

Planned troubleshooting and repair guidance layer.

## Phase 12 — Planned: SwissPinball Service API

Planned expansion into a broader SwissPinball platform API.

---

# Data Source

Machine data provided by:

**Open Pinball Database (OPDB)**  
https://opdb.org

---

# License

MIT