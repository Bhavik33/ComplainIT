# ResolveIT – DevOps Engineering Documentation

This document explains how the **ResolveIT Complaint Management System** serves as an end-to-end DevOps demonstration project suitable for academic viva and industry presentations.

---

## 1. Version Control & Git Strategy
- **Branching Model**:
  - `main`: Production-ready release code.
  - `develop`: Staging & integration branch.
  - `feature/*`: Short-lived topic branches for individual features.
- Commit messages follow conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `ci:`).

---

## 2. Continuous Integration & Code Quality
- **Automated Testing**: Unit and API integration testing executed via Jest + Supertest (`npm test`).
- **Static Code Analysis**: Configured with ESLint for syntax standard compliance and SonarQube (`sonar-project.properties`) for bug, vulnerability, code smell, and code coverage analysis.
- **Quality Gate**: The Jenkins CI pipeline enforces a SonarQube Quality Gate threshold before allowing docker builds.

---

## 3. Containerization & Security Scanning
- **Multi-Stage Docker Builds**: Base images set to lightweight `node:18-alpine` and `nginx:1.25-alpine` to reduce container attack surface and minimize image sizes.
- **Trivy Vulnerability Scanning**: Integrated into stage 12 of `Jenkinsfile` to scan docker container images for critical CVE vulnerabilities before registry push.

---

## 4. Kubernetes Orchestration & Helm
- **Kubernetes Manifests (`k8s/`)**:
  - `StatefulSet`: Deploys MongoDB with persistent storage (`PersistentVolumeClaim`).
  - `Deployment`: Deploys 2 replicas of Backend and Frontend with `RollingUpdate` strategy (`maxSurge: 1`, `maxUnavailable: 0`).
  - `Health Probes`: `livenessProbe` at `/health/live` and `readinessProbe` at `/health/ready`.
  - `Ingress`: Nginx Ingress routing for `resolveit.local`.
- **Helm Chart (`helm/resolveit/`)**: Parameterizes replica counts, image tags, environment variables, and resource requests/limits.

---

## 5. Observability & Monitoring
- **Prometheus Metrics (`/metrics`)**: Exposes custom metrics:
  - `resolveit_http_requests_total`: Total API request count by route & status.
  - `resolveit_complaints_created_total`: Counter by category & priority.
  - `resolveit_complaints_resolved_total`: Resolution counter.
  - `resolveit_sla_breaches_total`: SLA overdue breach counter.
- **Grafana Dashboard (Port 3000)**: Visualizes request throughput, latency histograms, error rates, and active user traffic.

---

## 6. Secrets & Environment Management
- Passwords, JWT secrets, and database credentials are decoupled from application source code.
- Environment configurations managed via `.env.example`, Kubernetes `ConfigMap` and `Secret`, and Jenkins Credentials Store.
