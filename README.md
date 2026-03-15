# SwissPinball System

Pinball machine intelligence platform for technicians and collectors.

This project provides a serverless backend and a React dashboard UI for managing pinball machines, customers, and service history.

---

# Overview

SwissPinball is designed to become a technician intelligence platform for pinball repair and machine management.

The system manages:

- pinball machine identification
- machine metadata
- customer records
- machine ownership
- machine instances
- service history

The backend runs fully serverless on AWS.

---

# Architecture

React Dashboard (Vite)

↓

API Gateway (HTTP API)

↓

AWS Lambda (Node.js 24)

↓

Service Layer

↓

DynamoDB

---

# Backend

Backend components

AWS Lambda  
API Gateway  
DynamoDB

Main Lambda function

ai-pinball-lookup

DynamoDB tables

pinball_machine_metadata  
pinball_customers  
pinball_machine_instances  
pinball_service_history

---

# Frontend

React dashboard built with

React  
Vite  
Fetch API

UI structure

Sidebar  
Dashboard  
Machines  
Customers  
Instances  
Service

---

# Machine Lookup

Machine lookup uses the Open Pinball Database (OPDB).

Example request

GET /machine?name=Corvette

Lookup flow

machineName  
→ OPDB search  
→ resolve best match  
→ fetch machine details  
→ normalized response

---

# Customer System

Customers can be created via

React UI  
API  
PowerShell

Example request

POST /customers

Example response

{
"customerId": "cust:ed4860e8-f134-4d60-9383-0da55ec61dbb",
"phone": "+41792024050",
"whatsapp": "https://wa.me/41792024050"
}

Phone numbers are normalized and WhatsApp links are generated automatically.

---

# CORS Configuration

CORS is enabled for the API Gateway HTTP API.

Example CLI configuration

aws apigatewayv2 update-api  
--api-id cp114tpb2i  
--cors-configuration AllowOrigins="\*" AllowMethods="GET,POST,PUT,DELETE,OPTIONS" AllowHeaders="Content-Type"  
--region eu-central-1  
--profile dev

---

# Development

Backend

npm install

Frontend

cd ui/pinball-ui  
npm install  
npm run dev

---

# API Endpoint

Base URL

https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod

Example endpoints

/machine?name=Corvette  
/customers  
/instances  
/service-records

---

# Current Capabilities

The system currently supports

- Machine lookup via OPDB
- Customer creation
- Machine instance storage
- Service history backend
- React dashboard UI
- AWS serverless deployment

---

# Roadmap

Upcoming features

- Machine Instance UI
- Service Record UI
- Workshop dashboard metrics

Long-term goals

- Machine knowledge base
- Repair documentation
- Machine ownership tracking
- AI-assisted repair lookup
- Workshop job management

---

# Vision

SwissPinball aims to become a machine intelligence platform for pinball technicians combining

machine data  
repair history  
service tracking  
technician knowledge

into a unified system.
