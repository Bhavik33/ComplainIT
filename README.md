# ResolveIT – Complaint Management System

Tagline: **“Raise. Track. Resolve.”**

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins%20Pipeline-blue.svg)](./Jenkinsfile)
[![Code Quality](https://img.shields.io/badge/SonarQube-Quality%20Gate%20Passed-brightgreen.svg)](./sonar-project.properties)
[![Docker Container](https://img.shields.io/badge/Docker-Multi--Stage-blue.svg)](./docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-StatefulSet%20%2B%20Ingress-purple.svg)](./k8s/)

ResolveIT is a full-stack, production-style **Complaint Management System** built for college/organizational complaint portals that serves as a comprehensive **DevOps Demonstration Project**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Architecture & Diagram](#-architecture--diagram)
4. [Technology Stack](#-technology-stack)
5. [Folder Structure](#-folder-structure)
6. [Local Setup Guide](#-local-setup-guide)
7. [Environment Variables](#-environment-variables)
8. [MongoDB Setup & Seed Data](#-mongodb-setup--seed-data)
9. [Running Backend Service](#-running-backend-service)
10. [Running Frontend App](#-running-frontend-app)
11. [Running with Docker Compose](#-running-with-docker-compose)
12. [Jenkins CI/CD Pipeline](#-jenkins-cicd-pipeline)
13. [SonarQube Static Code Analysis](#-sonarqube-static-code-analysis)
14. [Kubernetes Deployment](#-kubernetes-deployment)
15. [Helm Chart Deployment](#-helm-chart-deployment)
16. [Prometheus Monitoring](#-prometheus-monitoring)
17. [Grafana Setup](#-grafana-setup)
18. [Automated Testing & Coverage](#-automated-testing--coverage)
19. [Security Features](#-security-features)
20. [API Documentation (Swagger)](#-api-documentation-swagger)
21. [Demo Credentials](#-demo-credentials)
22. [Troubleshooting](#-troubleshooting)
23. [Future Enhancements](#-future-enhancements)

---

## 🚀 1. Project Overview
ResolveIT allows students, faculty, and employees to submit complaints, track progress via visual timelines, communicate with support staff, and rate resolutions. Administrators and staff can manage tickets, assign personnel, monitor SLAs, analyze workload metrics, and maintain security audit trails.

---

## ✨ 2. Key Features
- **3-Tier Role Access Control**: User, Staff, Admin.
- **Workflow State Machine**: `NEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED` (also supports `REJECTED`, `ON_HOLD`, `REOPENED`).
- **Human-Readable IDs**: Auto-generated sequence `CMP-2026-0001`, `CMP-2026-0002`.
- **Automated SLA Engine**: Dynamic resolution deadlines based on priority (`CRITICAL`: 8h, `HIGH`: 24h, `MEDIUM`: 48h, `LOW`: 72h) monitored via background cron jobs.
- **Recharts Analytics**: Admin dashboard with complaints over time, category breakdowns, status pie charts, and staff workload distribution.
- **DevOps Observability**: Native Prometheus metrics at `/metrics`, Swagger OpenAPI at `/api-docs`, Winston structured logging, and Kubernetes readiness/liveness health endpoints.

---

## 🏗️ 3. Architecture & Diagram
Refer to detailed architecture diagrams in [`docs/architecture.md`](./docs/architecture.md).

```
React + Vite (Frontend) ➔ Express.js API (Backend) ➔ MongoDB (Database)
                                │
                        Prometheus / Grafana
```

---

## 🛠️ 4. Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios, React Router DOM.
- **Backend**: Node.js, Express.js, Mongoose, JWT, BcryptJS, Multer, Node-cron, Winston, Prom-client.
- **DevOps**: Docker, Docker Compose, Jenkins, SonarQube, Trivy Scanner, Kubernetes, Helm, Prometheus, Grafana.

---

## 📁 5. Folder Structure
```
ComplainIT/
├── backend/               # Express.js REST API & Tests
├── frontend/              # React + Vite + Tailwind SPA
├── k8s/                   # Kubernetes YAML manifests
├── helm/resolveit/        # Helm deployment chart
├── monitoring/            # Prometheus & Grafana configs
├── docs/                  # Architecture & DevOps docs
├── docker-compose.yml     # Local container orchestration
├── Jenkinsfile            # 16-stage CI/CD pipeline
└── sonar-project.properties
```

---

## 🔑 6. Demo Credentials
The database seeder generates the following accounts out of the box:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@resolveit.com` | `Admin@123456` |
| **Support Staff** | `staff@resolveit.com` | `Staff@123456` |
| **Student / User** | `student@resolveit.com` | `Student@123456` |

---

## ⚡ 7. Quick Local Setup

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed Database
Make sure MongoDB is running locally on port 27017, then execute:
```bash
cd backend
npm run seed
```

### Step 3: Run Development Servers
```bash
# Terminal 1 - Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend Vite App (Port 5173)
cd frontend
npm run dev
```

Visit the app at **`http://localhost:5173`**.

---

## 🐳 8. Running with Docker Compose
To launch the complete containerized stack (Frontend, Backend, MongoDB, Prometheus, Grafana) with a single command:
```bash
docker-compose up -d --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Swagger Docs**: `http://localhost:5000/api-docs`
- **Prometheus Metrics**: `http://localhost:5000/metrics`
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3000` (User/Pass: `admin`/`admin`)

---

## ☸️ 9. Kubernetes & Helm Commands
```bash
# Deploy with kubectl
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# Deploy with Helm
helm install resolveit helm/resolveit/ -n resolveit --create-namespace
```

---

## 🧪 10. Automated Testing
```bash
cd backend
npm test
npm run test:coverage
```

---

## 📄 Documentation Links
- [DevOps Deep-Dive Guide (`docs/DEVOPS.md`)](./docs/DEVOPS.md)
- [Architecture & Flow Diagram (`docs/architecture.md`)](./docs/architecture.md)
