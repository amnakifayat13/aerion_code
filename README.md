# AERION – Agentic Enterprise Resource & Intelligence Orchestration Network

## Overview

AERION is an industry-focused **agentic AI decision and execution system** designed to monitor machines, analyze operational risks, and support intelligent decision-making using real-time data from sensors, ERP systems, and inventory databases.

This project was built as a **production-style MVP** and validated through a **national-level AI hackathon**, demonstrating how multiple AI agents can collaboratively reason, plan, and act within industrial environments under human control.

---

## What Problem Does AERION Solve?

Industries face frequent issues such as:

* Sudden machine breakdowns
* Delayed fault detection
* Manual decision-making based on scattered data
* Poor visibility into inventory and supplier risks

AERION solves this by acting as an **AI-powered operational layer** that:

* Detects problems early
* Analyzes risks using multiple agents
* Recommends or executes actions
* Keeps humans in control

---

## Core Idea (In Simple Words)

> Machines or systems send alerts → AI agents think together → a decision is made → action is suggested or executed → everything is logged for learning.

This is **not a chatbot** and **not simple automation**. It is an **agentic AI system**.

---

## System Architecture (High Level)

**Frontend**

* Next.js dashboards for operators and admins

**Backend**

* FastAPI for APIs, authentication, and ERP-style data handling
* MongoDB for products, suppliers, admins, and logs

**AI Layer**

* OpenAI Agents SDK for reasoning and planning
* MCP (Model Context Protocol) for secure tool execution

---

## Core AI Agents

### 1. Factory Orchestrator Agent

**Role:** Central coordinator of the system.

**Responsibilities:**

* Receives machine alerts or operational queries
* Understands the nature of the issue (machine stop, overheating, vibration, downtime)
* Delegates tasks to relevant specialized agents
* Controls agent handoffs and produces the final response

---

### 2. Automotive Downtime Agent

**Role:** Machine health and uptime analysis.

**Responsibilities:**

* Analyzes machine failures, overheating, vibration, and downtime
* Assesses operational risk related to production
* Provides maintenance recommendations
* Supports automotive and industrial manufacturing environments

---

### 3. Inventory Agent

**Role:** Inventory monitoring and supplier intelligence.

**Responsibilities:**

* Checks stock levels using ERP-style MCP tools
* Identifies low-stock and over-stock items
* Fetches supplier information for affected products
* Returns structured inventory reports in JSON format

---

### 4. Industry Risk Agent

**Role:** High-level industrial risk assessment.

**Responsibilities:**

* Analyzes machine-related operational risks
* Evaluates inventory and supply-chain risks
* Assesses supplier reliability
* Produces a consolidated industry risk report

---

## MCP Tools (AI Actions)

* Inventory stock checks
* Supplier lookup
* Maintenance request simulation
* ERP-style data updates
* Risk analysis for machines and inventory

These tools act as the **hands and legs** of the AI agents.

---

## Key Features Implemented

### 1. Machine Monitoring & Risk Analysis

* Simulated sensor data for machines
* AI analyzes temperature, vibration, maintenance delays
* Risk levels: LOW / MEDIUM / HIGH

### 2. Inventory Monitoring

* Low stock and overstock detection
* Supplier mapping for each product
* Automated alerts and reports

### 3. ERP-style Admin System

* Admin authentication (JWT-based)
* Product and supplier management
* Secure CRUD operations

### 4. Human-in-the-Loop Control

* AI suggests actions
* Humans approve or reject
* Full audit logs maintained

---

## Frontend Dashboards

* **Inventory Monitoring Page**

  * Critical stock alerts
  * Surplus detection
  * Supplier visibility

* **Machine Risk Dashboard**

  * Machine health status
  * Risk scores
  * Maintenance recommendations

* **Admin Panel**

  * Secure login
  * Product and supplier management

---

## Technology Stack

* **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion
* **Backend:** FastAPI, MongoDB (Motor)
* **AI:** OpenAI Agents SDK
* **Tool Orchestration:** MCP (FastMCP)
* **Auth:** JWT, OAuth2
* **Media:** Cloudinary

---

## Hardware Clarification

This solution is **software-based** and integrates with **existing industrial sensors and ERP systems**. No custom hardware is required.

---

## Why AERION Is Unique

* Uses **multiple AI agents**, not a single model
* Separates reasoning from execution
* Human control is always maintained
* Designed for **real industrial workflows**, not demos

---

## Hackathon Validation

* Built and demonstrated as a working MVP
* Recognized at a national-level agentic AI hackathon

---

## Future Scope

* Real sensor integration
* Predictive maintenance models
* Digital twin simulations
* Voice-based operator control

---

