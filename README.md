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

```
Client
  ↓
API Gateway (Phase 8)
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

# Phase 8 — API Gateway

Phase 8 exposes the backend through a **public HTTP API** using **AWS API Gateway**.

### API Base URL

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

### Route

```
GET /machine
```

### Example Request

```
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod/machine?name=Addams%20Family
```

### Supported Query Parameters

| Parameter | Description |
|----------|-------------|
| name | Machine name |
| machineName | Alternative parameter |

### Example Request

```
GET /machine?name=Corvette
```

### Example Response

```json
{
  "source": "opdb-machine",
  "query": "Corvette",
  "selectedMatch": {
    "id": "GrjDz-MJKN6",
    "text": "Corvette (Bally, 1994)"
  },
  "result": {
    "opdb_id": "GrjDz-MJKN6",
    "name": "Corvette",
    "shortname": "CRVT",
    "manufacturer": "Bally",
    "manufacturer_full_name": "Bally Manufacturing Co.",
    "manufacture_date": "1994-01-08",
    "type": "ss",
    "display": "dmd",
    "player_count": 4
  },
  "cache": {
    "hit": true
  }
}
```

---

# Project Structure

```
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

```
OPDB_API_TOKEN
MACHINE_TABLE_NAME
AWS_REGION
```

Example:

```
OPDB_API_TOKEN=your_opdb_token
MACHINE_TABLE_NAME=pinball_machines
AWS_REGION=eu-central-1
```

---

# DynamoDB Table

Table name:

```
pinball_machines
```

Partition key:

```
machineKey (String)
```

Example stored item:

```
machineKey: medieval madness
query: Medieval Madness
cachedAt: 2026-03-09T11:38:13.344Z
result: { normalized machine data }
```

---

# Local Development

### Install dependencies

```
npm install
```

### Create `.env`

```
OPDB_API_TOKEN=your_token
MACHINE_TABLE_NAME=pinball_machines
AWS_REGION=eu-central-1
```

### Run local test

```
node test-detail.js
```

---

# Deployment

Deployment is handled through **GitHub Actions**.

Typical workflow:

```
git add .
git commit -m "update"
git push
```

GitHub Actions deploys the Lambda automatically.

---

# Development Phases

| Phase | Description |
|------|-------------|
| 1 | Project bootstrap |
| 2 | Lambda handler |
| 3 | OPDB typeahead search |
| 4 | OPDB machine detail lookup |
| 5 | normalized response format |
| 6 | DynamoDB cache (local) |
| 7 | DynamoDB cache deployed to Lambda |
| 8 | API Gateway public HTTP API |

---

# Planned Future Work

### Phase 9
Machine alias support:

```
tz → Twilight Zone
taf → Addams Family
mm → Medieval Madness
afm → Attack from Mars
```

### Phase 10
AI machine summaries using **Amazon Bedrock**.

### Phase 11
Pinball repair knowledge assistant.

### Phase 12
SwissPinball service API.

---

# Data Source

Machine data provided by:

**Open Pinball Database (OPDB)**  
https://opdb.org

---

# License

MIT