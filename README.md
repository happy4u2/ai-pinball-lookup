# AI Pinball Lookup

Serverless backend that returns structured pinball machine information using the **Open Pinball Database (OPDB)**.

The system performs machine lookup, normalizes the data, and caches results in **AWS DynamoDB** to improve performance.

---

# Project Status

Current Phase: **Phase 7 — DynamoDB Cache deployed to Lambda**

Working features:

- OPDB typeahead machine search
- OPDB machine detail lookup
- normalized machine response format
- DynamoDB cache layer
- improved match selection (prefer original machines over special editions)
- deployed AWS Lambda backend
- local testing harness

---

# Architecture

```
Client Request
      ↓
AWS Lambda
      ↓
DynamoDB Cache
   ├─ HIT  → return cached machine
   └─ MISS
        ↓
     OPDB Typeahead Search
        ↓
     Select Best Match
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

# Example Request

```json
{
  "machineName": "Medieval Madness"
}
```

---

# Example Response

```json
{
  "source": "opdb-machine",
  "query": "Medieval Madness",
  "selectedMatch": {
    "id": "G5pe4-MePZv",
    "text": "Medieval Madness (Williams, 1997)"
  },
  "result": {
    "opdb_id": "G5pe4-MePZv",
    "name": "Medieval Madness",
    "shortname": "MM",
    "manufacturer": "Williams",
    "manufacture_date": "1997-06-01",
    "display": "dmd",
    "player_count": 4
  },
  "cache": {
    "hit": true,
    "cachedAt": "2026-03-09T11:38:13.344Z"
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

Set environment variables:

```powershell
$env:AWS_PROFILE="dev"
$env:AWS_REGION="eu-central-1"
$env:OPDB_API_TOKEN="your_token"
$env:MACHINE_TABLE_NAME="pinball_machines"
```

Run local test:

```powershell
node test-detail.js
```

---

# Deployment

Deployment is handled through **GitHub Actions**.

Typical workflow:

```bash
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

---

# Planned Future Work

Phase 8 possibilities:

- Amazon Bedrock AI machine summaries
- API Gateway public endpoint
- machine alias handling (TAF, TZ, MM)
- fuzzy search improvements
- rule sheet lookup
- repair knowledge assistant

---

# Data Source

Machine data is provided by:

**Open Pinball Database (OPDB)**  
https://opdb.org

---

# License

MIT