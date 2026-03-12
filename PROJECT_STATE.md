PROJECT CONTEXT — AI Pinball Lookup Backend

I am building a serverless backend for SwissPinball.

Stack
AWS Lambda (Node.js 24)
API Gateway (HTTP API)
DynamoDB
GitHub (auto deploy via GitHub Actions)

Goal
Build a machine intelligence backend for pinball technicians.

The system provides:

• machine identification
• structured machine metadata
• customer tracking
• machine ownership tracking
• service history tracking
• future AI repair assistant

---

CURRENT ARCHITECTURE

Client
↓
API Gateway
↓
Lambda (ai-pinball-lookup)
↓
Route Dispatcher
↓
Domain Routes
↓
Service Layer
↓
DynamoDB

External Data Sources

• OPDB (Open Pinball Database)
• IPDB (manual discovery)

---

PROJECT STRUCTURE

lambda/

handler.js

routes/
customerRoutes.js
instanceRoutes.js
serviceRecordRoutes.js
machineRoutes.js
routeUtils.js

scripts/
opdbService.js
opdbDetailService.js
cacheService.js
metadataService.js
metadataMapper.js
mergeMachineData.js
metadataKeys.js
ipdbManualService.js
updateMetadataRecord.js
customerService.js
instanceService.js
serviceRecordService.js

---

IMPLEMENTED API

Machine Lookup

GET /machine?q=
GET /machine?name=
GET /machine?id=
POST /machine (metadata updates)

Customer System

POST /customers
GET /customers
GET /customers/{id}
PUT /customers/{id}

Machine Instances

POST /instances
GET /instances
GET /instances/{id}
PUT /instances/{id}

Service History

POST /service-records
GET /service-records/{id}
GET /instances/{id}/service-records

---

DATABASE TABLES

machines_cache
machine_metadata
customers
pinball_machine_instances
pinball_service_history

---

KEY SYSTEM FEATURES

OPDB machine search
machine detail lookup
machine metadata enrichment
IPDB manual discovery
machine cache
customer management
machine ownership tracking
service history tracking

---

ROUTING SYSTEM

The Lambda handler is now modular.

handler.js
dispatches requests to route modules:

customerRoutes.js
instanceRoutes.js
serviceRecordRoutes.js
machineRoutes.js

Each route module calls a corresponding service layer.

---

CACHE STRATEGY

Machine cache keys

name:twilight zone
id:GrXzD-MjBPX

Stored in DynamoDB.

---

CURRENT STATUS

The backend is now fully functional and stable.

Working endpoints confirmed:

/machine
/customers
/instances
/service-records

Handler refactor completed.
Routes modularized.
Service history system working.

---

NEXT DEVELOPMENT PHASES

Phase 15
Service Record Editing

PUT /service-records/{serviceId}

Allows updating:

status
labor cost
notes
parts used

---

Phase 16
Service Timeline API

GET /instances/{id}/history

Returns chronological repair history for a machine.

---

Phase 17
Machine Knowledge Base

Extend metadata with:

repair tips
common failures
recommended parts
board schematics
links to manuals

---

Phase 18
Technician AI Assistant

Using AWS Bedrock.

Capabilities

• repair suggestions
• troubleshooting
• machine diagnostics
• parts recommendations

---

Phase 19
SwissPinball Platform API

Support for

customer portal
technician dashboard
repair reports
machine inventory

---

DEVELOPMENT GOAL

Turn this backend into a

PINBALL MACHINE INTELLIGENCE PLATFORM

for technicians, collectors, and operators.

---

REQUEST

Continue development starting with:

Phase 15
PUT /service-records/{serviceId}

Provide:

1. serviceRecordService update function
2. route implementation
3. test request
4. DynamoDB update logic
