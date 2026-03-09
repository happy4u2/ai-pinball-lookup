## Phase 8 — API Gateway

The project now exposes a public HTTP API using **AWS API Gateway**.

### Public Base URL

```text
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod
```

### Route

```text
GET /machine
```

### Example Request

```text
GET /prod/machine?name=Addams%20Family
```

Full URL:

```text
https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod/machine?name=Addams%20Family
```

### Supported Query Parameters

- `name`
- `machineName`

### Architecture

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
     Fallback Search / Match Scoring
        ↓
     OPDB Machine Detail Lookup
        ↓
     Normalize Machine Data
        ↓
     Save to DynamoDB
        ↓
     Return JSON Response
```

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

### Notes

- The API is publicly accessible through API Gateway.
- The Lambda handler supports both:
  - JSON body input for local/Lambda testing
  - query string input for HTTP API access
- Current supported route:
  - `GET /machine`

### Current API Flow

```text
GET /machine?name=Twilight%20Zone
        ↓
API Gateway
        ↓
Lambda handler
        ↓
DynamoDB cache lookup
   ├─ hit → return cached normalized result
   └─ miss → OPDB search
            → fallback search if needed
            → best match scoring
            → OPDB detail lookup
            → normalize result
            → save to DynamoDB
            → return JSON
```