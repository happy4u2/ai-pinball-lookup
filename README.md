# AI Pinball Lookup

AI-assisted serverless backend for looking up pinball machine information by machine name.

This project provides a structured API that returns reliable metadata about pinball machines using the **Open Pinball Database (OPDB)** and optional **AI enrichment via Amazon Bedrock**.

---

## Project Goal

Build an AWS-based backend where a user submits the name of a pinball machine and receives structured machine information as JSON.

Example request:

```json
{
  "machineName": "Twilight Zone"
}

Example response:

{
  "source": "opdb-machine",
  "result": {
    "name": "Twilight Zone",
    "shortname": "TZ",
    "manufacturer": "Bally",
    "manufacture_date": "1993-05-04",
    "display": "DMD",
    "player_count": 4,
    "features": ["Widebody"]
  }
}
Architecture

The system is designed as a serverless AWS architecture.

User Request
     │
     ▼
API Gateway
     │
     ▼
AWS Lambda (Node.js)
     │
     ▼
OPDB Machine Lookup
     │
     ▼
Optional AI enrichment (Amazon Bedrock)
     │
     ▼
JSON Response
Data Sources
Open Pinball Database (OPDB)

Primary structured data source for pinball machines.

Typical metadata returned:

Machine name

Short name

Manufacturer

Manufacture date

Display type

Player count

Features

Keywords

Images

Amazon Bedrock (Optional AI Layer)

Amazon Bedrock can be used to enrich machine data with AI assistance.

Possible uses include:

Generating summaries of machines

Normalizing machine names

Providing fallback descriptions

Flagging uncertain data

Returning structured JSON responses

The AI layer is optional and designed to enhance the quality of responses.

Project Structure
ai-pinball-lookup/
│
├── README.md
├── .gitignore
│
├── docs/
│   Architecture notes and documentation
│
├── lambda/
│   AWS Lambda handlers and machine lookup logic
│
├── infra/
│   Infrastructure configuration and deployment notes
│
├── tests/
│   Unit and integration tests
│
└── scripts/
    Development and deployment utilities
Minimum Viable Product (MVP)

The first version of the project will:

Accept a pinball machine name

Query the OPDB database

Return structured machine information

Produce clean JSON responses

Handle missing or ambiguous matches safely

Future Enhancements

Planned improvements include:

AI-generated machine summaries

Machine name disambiguation

Multi-match ranking

API authentication

Request logging

Result caching

Frontend search interface

Machine alias detection

Verification flags for uncertain data

Example API Request
GET /machine?name=Twilight%20Zone

Example response:

{
  "source": "opdb-machine",
  "result": {
    "name": "Twilight Zone",
    "manufacturer": "Bally",
    "year": 1993,
    "display": "DMD",
    "players": 4
  }
}
Development Roadmap
Phase 1 — Repository Bootstrap

Create repository structure and documentation.

Phase 2 — Lambda MVP

Build Lambda handler that:

accepts machineName

queries OPDB

returns structured JSON

Phase 3 — API Gateway

Expose the service through a REST API endpoint.

Phase 4 — AI Enrichment

Integrate Amazon Bedrock for enhanced responses.

Phase 5 — Production Hardening

input validation

logging

error handling

IAM security tightening

rate limiting

cost monitoring

Status

Current status:

Git repository initialized

GitHub repository connected

Initial project scaffold created

Ready for Lambda implementation

Author

David Haughton
SwissPinball
Pinball restoration, repair, and machine data tools


---

### Then commit it

```bash
git add README.md
git commit -m "Add project README"
git push