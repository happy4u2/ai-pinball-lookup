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
- public API endpoint via API Gateway

---

# Architecture

```
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

---

# Example API Response

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

The Lambda function requires the following environment variables:

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

GitHub Actions deploys the Lambda function automatically.

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
| 8 | API Gateway public endpoint |

---

# Planned Future Work

Possible next phases:

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

Machine data is provided by:

**Open Pinball Database (OPDB)**  
https://opdb.org

---

# License

MIT