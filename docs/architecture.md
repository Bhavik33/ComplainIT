# ResolveIT System Architecture & DevOps Flow

## 1. System Architecture Overview

```
User (Browser)
    │
    ▼
React Frontend (Port 5173 / Nginx Port 80)
    │
    ▼
REST API (Node.js + Express.js - Port 5000)
    ├── Authentication (JWT + Bcrypt)
    ├── Structured Logger (Winston)
    ├── Metrics Exporter (/metrics - Prometheus Client)
    ├── OpenAPI / Swagger Docs (/api-docs)
    └── SLA Cron Checker (node-cron)
    │
    ▼
MongoDB Database (Mongoose ORM - Port 27017)
```

---

## 2. DevOps CI/CD Lifecycle Flow

```
Developer (Git Commit & Push)
    │
    ▼
GitHub Repository (main / develop / feature/*)
    │
    ▼
Jenkins Automation Server (Jenkinsfile 16-Stage Pipeline)
    ├── 1. Checkout
    ├── 2. Install Dependencies (npm ci)
    ├── 3. Code Linting (ESLint)
    ├── 4. Unit Testing (Jest)
    ├── 5. Integration Testing (Supertest)
    ├── 6. Test Coverage Generation
    ├── 7. SonarQube Static Code Analysis
    ├── 8. Quality Gate Verification
    ├── 9. Frontend Production Build (Vite)
    ├── 10. Backend Assembly
    ├── 11. Multi-Stage Docker Build
    ├── 12. Container Vulnerability Scan (Trivy)
    ├── 13. Docker Hub Image Push
    ├── 14. Kubernetes / Docker Compose Deployment
    ├── 15. Endpoint Smoke Test
    └── 16. Pipeline Result Notification
```

---

## 3. DevOps Observability & Monitoring Flow

```
ResolveIT Express API
    │ Exposes /metrics
    ▼
Prometheus Server (Scrapes metrics every 15s - Port 9090)
    │ Evaluates alert rules & custom counters
    ▼
Grafana Dashboard (Visualization & SLA breach monitoring - Port 3000)
```
