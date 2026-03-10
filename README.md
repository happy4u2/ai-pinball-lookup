# AI Pinball Lookup

Serverless pinball machine lookup API built on AWS.

This project provides intelligent search, disambiguation, and normalized machine data powered by the **Open Pinball Database (OPDB)**.

The system supports:

- machine search
- variant disambiguation
- typeahead suggestions
- DynamoDB caching
- normalized machine metadata

The backend powers a React UI and is designed to integrate into **SwissPinball.com**.

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
   └── OPDB API
```

Request flow:

```
Search query
   │
   ▼
Typeahead endpoint (?q=)
   │
   ▼
Machine lookup (?name= or ?id=)
   │
   ▼
Match resolution
   │
   ▼
Machine details
   │
   ▼
Normalized response
```

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
  "result": { ... },
  "cache": {
    "hit": false
  }
}
```

### Disambiguation

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
GET /machine?id=G4ZVB-MJ5lE
```

Example response

```json
{
  "mode": "result",
  "source": "opdb-machine",
  "selectedMatch": {
    "id": "G4ZVB-MJ5lE",
    "name": "Jurassic Park",
    "supplementary": "Data East, 1993"
  },
  "result": { ... }
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
    └── dynamoClient.js
```

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

Example machine families:

```
Addams Family
    ├── The Addams Family (1992)
    ├── The Addams Family Gold
    └── The Addams Family Special Collectors Edition

Jurassic Park
    ├── Jurassic Park (1993)
    ├── The Lost World Jurassic Park
    ├── Jurassic Park (Pro)
    ├── Jurassic Park (Premium)
    └── Jurassic Park (LE)
```

---

# DynamoDB Cache

Table

```
pinball_machines
```

Primary key

```
machineKey
```

Example keys

```
id:G4ZVB-MJ5lE
name:twilight zone
```

Example record

```json
{
  "machineKey": "id:g4zvb-mj5le",
  "query": "Jurassic Park",
  "source": "opdb-machine",
  "selectedMatch": { ... },
  "result": { ... },
  "cachedAt": "2026-03-10T09:05:31Z"
}
```

Cache strategy

| Query Type        | Cached |
| ----------------- | ------ |
| Typeahead         | No     |
| Ambiguous search  | No     |
| Exact machine ID  | Yes    |
| Exact title match | Yes    |

This prevents disambiguation results from being incorrectly cached.

---

# Frontend

React + Vite + Tailwind.

Local development

```
npm install
npm run dev
```

Local UI

```
http://localhost:5173
```

Frontend features

- typeahead search
- suggestion selection
- machine preview
- normalized JSON viewer

---

# Technologies

Backend

- AWS Lambda (Node.js 24)
- API Gateway
- DynamoDB
- AWS SDK v3

Frontend

- React
- Vite
- TailwindCSS

External data

- OPDB (Open Pinball Database)

---

# Current Project Phase

```
Phase 9
Typeahead + Disambiguation + DynamoDB Cache
```

Working features

- OPDB search
- machine detail lookup
- intelligent match resolution
- disambiguation system
- DynamoDB caching
- React UI
- typeahead suggestions

---

# Future Plans

Backend improvements

- query analyzer
- improved ranking engine
- machine family grouping
- persistent machine metadata store

Future features

- AI repair assistant
- machine knowledge base
- SwissPinball integration
- WordPress REST integration

Example future capability

```
Machine: Bally Corvette
Problem: weak flipper
```

AI could return

- likely causes
- coil specifications
- EOS switch test procedure
- replacement parts list

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
