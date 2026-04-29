# Taskflow — Task Management App

Taskflow lets users create boards, organize work into columns, and manage tasks with due dates. This all runs on a containerized, self-healing Kubernetes infrastructure deployable from a single Helm command.

---

## What Was Built

### Application Features
- **Authentication** — sign up and log in with a username and password; sessions are stored in localStorage and all routes are protected
- **Boards** — create and delete personal Kanban boards; each board auto-generates three default columns (To Do, In Progress, Completed)
- **Columns** — add and delete columns on any board
- **Tasks** — create tasks with a title, optional description, and optional due date; move tasks between columns; delete tasks; overdue tasks are visually flagged with a warning indicator

---

## Project Structure

- backend
  - `src/server.js` — all REST API endpoints (auth, boards, columns, tasks)
  - `src/db/index.js` — PostgreSQL connection pool using env vars injected by Helm
  - `Dockerfile` — multi-stage build: installs production deps, then copies into a non-root runner image

- frontend
  - `src/api.js` — all fetch calls to the backend, routed through `/api/`
  - `src/App.jsx` — React Router setup and protected route logic
  - `src/pages/` — Login, Signup, Boards list, Board (Kanban view)
  - `src/components/` — Column, Task
  - `nginx.conf` — SPA routing fallback and `/api/` reverse proxy to the backend service
  - `Dockerfile` — multi-stage build: Vite compiles the React app, nginx:alpine serves the static output

- helm/task-management-app
  - `charts/backend/` — Deployment, Service, ConfigMap, Secret, PodDisruptionBudget
  - `charts/frontend/` — Deployment, Service, Ingress, ConfigMap, PodDisruptionBudget
  - `charts/database/` — StatefulSet, ClusterIP Service, Headless Service, Secret, ConfigMap, CronJob, PVCs, PodDisruptionBudget
  - `values/backend.yaml` — replica count, image, resource limits, DB connection config
  - `values/frontend.yaml` — replica count, image, ingress host, backend service URL
  - `values/database.yaml` — storage size, backup schedule, credentials, external DB flag

---

## Relevant Code Explained

### Backend

Liveness and readiness probes in the Helm chart hit the following endpoint:

```js
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
```

---

### Helm — External Database Switch (`helm/.../charts/database/values.yaml`)

The database chart supports two modes controlled by a single flag:

```yaml
external:
  enabled: false
  host: "" 
  port: 5432
```

- **Local mode (`false`)**: deploys a PostgreSQL StatefulSet with a PersistentVolumeClaim and a daily `pg_dump` backup CronJob
- **External mode (`true`)**: `postgres-service` becomes a Kubernetes `ExternalName` service, a DNS alias pointing to the RDS endpoint

The backend always connects to `postgres-service:5432` regardless of mode, so no backend config changes are needed when switching

---

### DevOps — Reliability Features

**Zero-downtime rolling deploys** (backend and frontend Deployments):
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0 
    maxSurge: 1  
```

**Self-healing** — liveness probes restart pods that stop responding; readiness probes prevent traffic from reaching a pod before it is ready:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  failureThreshold: 3
```

**Data persistence** — the StatefulSet uses `volumeClaimTemplates` so the PVC lifecycle is independent of the pod. The database can crash and restart without losing any data.

**PodDisruptionBudgets** — all three services have a PDB ensuring at least one replica stays running during cluster maintenance or node upgrades.

**Automated backups** — a CronJob runs `pg_dump` nightly at 2am, writes timestamped `.sql` files to a dedicated PVC, and prunes files older than 7 days.

---

## How to Run Locally

### Prerequisites
- [Docker Desktop]
- [Minikube]
- [kubectl]
- [Helm]

### 1. Start Minikube
```bash
minikube start
```

### 2. Point Docker at Minikube's daemon
```bash
eval $(minikube docker-env)
```

### 3. Build the Docker images
```bash
docker build -t task-management-backend:latest ./backend
docker build -t task-management-frontend:latest ./frontend
```

### 4. Deploy with Helm
```bash
helm install app ./helm/task-management-app \
  -f helm/task-management-app/values/backend.yaml \
  -f helm/task-management-app/values/database.yaml \
  -f helm/task-management-app/values/frontend.yaml
```

### 5. Expose the frontend 
```bash
kubectl port-forward service/app-frontend 8080:80
```

### 7. Open the app
At [http://localhost:8080](http://localhost:8080) 

---

## Stopping and Restarting

```bash
helm uninstall app
minikube stop
```

---
