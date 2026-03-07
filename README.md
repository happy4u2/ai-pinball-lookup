# AI Pinball Lookup

AI-assisted serverless backend for looking up pinball machine information by machine name.

This project provides a structured API that returns reliable metadata about pinball machines using the Open Pinball Database (OPDB) and optional AI enrichment via Amazon Bedrock.

## Project Goal

Build an AWS-based backend where a user submits the name of a pinball machine and receives structured machine information as JSON.

Example request:

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
    "player_count": 4
  }
}

## Architecture

User Request  
↓  
API Gateway  
↓  
AWS Lambda (Node.js)  
↓  
OPDB Machine Lookup  
↓  
Optional AI enrichment (Amazon Bedrock)  
↓  
JSON Response

## Data Sources

### Open Pinball Database (OPDB)

Primary structured data source for pinball machines.

Typical metadata returned includes:

- Machine name  
- Short name  
- Manufacturer  
- Manufacture date  
- Display type  
- Player count  
- Features  
- Keywords  
- Images  

### Amazon Bedrock

Amazon Bedrock can optionally be used to enrich machine data using AI.

Possible uses include:

- generating summaries of machines  
- normalizing machine names  
- providing fallback descriptions  
- flagging uncertain data  

## Project Structure

ai-pinball-lookup/

README.md  
.gitignore  

docs/  
Architecture notes and documentation  

lambda/  
AWS Lambda handlers and lookup logic  

infra/  
Infrastructure configuration  

tests/  
Unit and integration tests  

scripts/  
Development utilities  

## Minimum Viable Product

The first working version will:

- accept a pinball machine name
- query the OPDB database
- return structured machine information
- produce clean JSON responses
- handle missing or ambiguous matches safely

## Future Enhancements

Planned improvements include:

- AI-generated machine summaries  
- machine name disambiguation  
- multi-match ranking  
- API authentication  
- request logging  
- result caching  
- frontend search interface  

## Development Roadmap

Phase 1 — Repository bootstrap  
Phase 2 — Lambda MVP  
Phase 3 — API Gateway integration  
Phase 4 — Bedrock enrichment  
Phase 5 — Production hardening  

## Status

Current status:

- Git repository created
- GitHub repository connected
- Initial project scaffold committed
- Ready for Lambda implementation

## Author

David Haughton  
SwissPinball