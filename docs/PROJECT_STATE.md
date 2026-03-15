# SwissPinball AI Backend + UI
# Project State Snapshot

Last Updated: 2026-03-15

---

# Project Overview

SwissPinball is a serverless system for managing pinball machines, customers, and service history.

The system consists of two main components:

1. AWS Serverless Backend
2. React Dashboard UI

The goal is to create a **technician intelligence platform for pinball repair and management**.

---

# System Architecture

Frontend

React (Vite)

↓

API Gateway (HTTP API)

↓

AWS Lambda (Node.js 24)

↓

Route Dispatcher

↓

Service Layer

↓

DynamoDB

---

# Backend Status

Backend is deployed and operational.

Base API endpoint:

https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod

Working routes:

GET /machine  
Machine lookup via OPDB

POST /customers  
Create customer record

GET /instances  
List machine instances

POST /instances  
Create machine instance

GET /instances/{id}/history  
Retrieve service history

POST /service-records  
Create service record

---

# DynamoDB Tables

pinball_machine_metadata

pinball_customers

pinball_machine_instances

pinball_service_history

---

# Machine Lookup Engine

Machine lookup uses the Open Pinball Database.

Flow:

machineName
→ OPDB search
→ resolve best match
→ OPDB detail fetch
→ normalized machine record

Example query:

/machine?name=Corvette

---

# Customer System

Customer creation now works from both:

PowerShell
React UI

Example record:

customerId  
cust:ed4860e8-f134-4d60-9383-0da55ec61dbb

Phone numbers are normalized to international format and WhatsApp links are generated automatically.

Example:

phone: +41792024050  
whatsapp: https://wa.me/41792024050

---

# React UI Status

Frontend stack:

React
Vite
Fetch API

Working features:

Machine Lookup page
Customer Creation page
Dashboard shell

UI structure:

Sidebar Navigation

Dashboard
Machines
Customers
Instances
Service

Dashboard layout includes:

Dark sidebar
Dashboard stat cards
Content panels

---

# CORS Configuration

API Gateway CORS enabled via CLI.

Command used:

aws apigatewayv2 update-api  
--api-id cp114tpb2i  
--cors-configuration AllowOrigins="*" AllowMethods="GET,POST,PUT,DELETE,OPTIONS" AllowHeaders="Content-Type"  
--region eu-central-1  
--profile dev

Browser communication now works correctly.

---

# Example Working Workflow

Customer Creation

React UI  
↓

POST /customers

↓

DynamoDB record created

Example:

Customer: Susy D’Anto  
Machine: Williams Black Knight 2000  
Location: Bussy-Chardonney

---

# Current System Capabilities

Machine lookup from OPDB

Customer record creation

Machine instance storage

Service history system (backend ready)

React UI dashboard shell

AWS serverless deployment

---

# Next Development Phase

Implement the **complete workshop workflow**.

Customer  
↓

Machine Instance  
↓

Service Record

Example:

Customer  
Susy D’Anto

Instance  
Black Knight 2000

Service  
Repair left flipper

---

# Immediate Next Tasks

Create Instance creation UI

Create Service Record UI

Attach machines to customers

Display service history

Improve dashboard metrics

Customers count

Machines in workshop

Machines on rent

Open repair jobs

---

# Long Term Vision

SwissPinball becomes a **machine intelligence platform for pinball technicians**.

Capabilities will include:

Machine knowledge base

Repair documentation

Machine ownership tracking

Service history database

AI-assisted repair lookup

Automatic machine recognition

Parts tracking

Workshop job management

---

# CONTINUATION PROMPT FOR NEW CHAT

Paste this prompt at the start of the next conversation:

---

You are continuing development of the SwissPinball system.

Backend:
AWS Lambda (Node.js 24)
API Gateway HTTP API
DynamoDB

Frontend:
React + Vite dashboard.

Working features:

Machine lookup via OPDB
Customer creation via API
Dashboard UI with sidebar
Customers page
Machines page

Architecture:

React UI
→ API Gateway
→ Lambda router
→ Service layer
→ DynamoDB

Next feature to implement:

Machine Instance UI.

Goal:

Customer → Machine Instance → Service Record workflow.

Continue development from this state.