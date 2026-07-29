# Verteilte Systeme Projekt — Budget App

A microservices-based budget tracking application built for the *Verteilte Systeme* course at HTW Berlin. The application lets users manage budgets and expenses, receive notifications when they approach or exceed their spending limits, and view everything through a single React frontend.

The project demonstrates a full microservices architecture: independent services written in **different technologies**, each running in its own Docker container, communicating over HTTP through a central **API Gateway**, and orchestrated with a single `docker compose up`.

---

## Architecture

```
                        ┌─────────────────────┐
                        │   React Frontend    │
                        │   (Vite, port 5173) │
                        └──────────┬──────────┘
                                   │  HTTP
                        ┌──────────▼──────────┐
                        │   Gateway Service   │
                        │  (NestJS, port 3000)│
                        └──────────┬──────────┘
             ┌───────────┬─────────┼─────────┬───────────────┐
             │           │         │         │               │
     ┌───────▼──┐ ┌──────▼───┐ ┌───▼─────┐ ┌─▼─────────────┐ │
     │  User    │ │ Expenses │ │ Budget  │ │ Notifications │ │
     │ Service  │ │ Service  │ │ Service │ │   Service     │ │
     │ (Node)   │ │ (Django) │ │(NestJS) │ │ (Spring Boot) │ │
     │  :3001   │ │  :3002   │ │  :3003  │ │    :3004      │ │
     └────┬─────┘ └──────────┘ └────┬────┘ └───────────────┘ │
          │                         │                         │
          └─────────────┬───────────┘                         │
                        │                                     │
                  ┌─────▼──────┐                              │
                  │ PostgreSQL │◄─────────────────────────────┘
                  │   :5433    │
                  └────────────┘
```

The frontend only ever talks to the gateway. The gateway forwards each request to the responsible service. Services do not call each other directly — the frontend coordinates cross-service actions (for example, firing a notification after an expense is created).

---

## Services

| Service | Technology | Port | Database | Description |
|---|---|---|---|---|
| **gateway-service** | NestJS (TypeScript) | 3000 | — | Single entry point. Routes requests to the correct service. |
| **user-service** | Node.js (Express) | 3001 | PostgreSQL (`userdb`) | User accounts, registration, and login. |
| **expenses** | Django (Python) | 3002 | SQLite | Create, list, edit, and delete expenses. |
| **budget-service** | NestJS + Prisma | 3003 | PostgreSQL (`budgetdb`) | Create, list, edit, and delete budgets. |
| **notifications-service** | Spring Boot (Java) | 3004 | In-memory | Stores and serves notifications; sends a weekly reminder. |
| **postgres** | PostgreSQL 16 | 5433 | — | Shared database server for user and budget services. |
| **frontend** | React + Vite | 5173 | — | User interface for the whole application. |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js](https://nodejs.org/) 20+ (only needed to run the frontend locally)

---

## Running the project

### 1. Start all backend services

From the project root:

```bash
docker compose up --build
```

This builds and starts all five services plus PostgreSQL. The first run takes a few minutes while images are built. The system is ready when each service logs a "started" message and the output goes quiet.

### 2. First-time database setup

Some services need their database initialised the first time you run the project:

```bash
# Create the user database (if it doesn't exist yet)
docker compose exec postgres psql -U postgres -c "CREATE DATABASE userdb;"

# Apply Django migrations for the expenses service
docker compose exec expenses python manage.py migrate

# Resolve the Prisma migration for the budget service
docker compose run --rm budget-service npx prisma migrate resolve --applied 20260511191933_init
```

### 3. Start the frontend

In a separate terminal:

```bash
cd budget-frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) in your browser.

---

## API Gateway routes

All routes are prefixed with `/api` and served from `http://localhost:3000`.

### Budgets
| Method | Route | Forwards to |
|---|---|---|
| GET | `/api/budgets` | budget-service |
| POST | `/api/budgets` | budget-service |
| PUT | `/api/budgets/:id` | budget-service |
| DELETE | `/api/budgets/:id` | budget-service |

### Expenses
| Method | Route | Forwards to |
|---|---|---|
| GET | `/api/expenses` | expenses |
| POST | `/api/expenses` | expenses |
| PUT | `/api/expenses/:id` | expenses |
| DELETE | `/api/expenses/:id` | expenses |

### Users
| Method | Route | Forwards to |
|---|---|---|
| GET | `/api/users` | user-service |
| POST | `/api/users` | user-service |
| POST | `/api/login` | user-service |
| DELETE | `/api/users/:id` | user-service |

### Notifications
| Method | Route | Forwards to |
|---|---|---|
| GET | `/api/notifications` | notifications-service |
| POST | `/api/notifications` | notifications-service |
| PATCH | `/api/notifications/:id/read` | notifications-service |

---

## Notifications

The notifications service stores notifications and serves them to the frontend. Notifications are triggered by user actions and by spending thresholds:

| Type | When it fires |
|---|---|
| `BUDGET_CREATED` | A new budget is created |
| `BUDGET_UPDATED` | A budget is edited |
| `BUDGET_DELETED` | A budget is deleted |
| `EXPENSE_CREATED` | A new expense is added |
| `EXPENSE_UPDATED` | An expense is edited |
| `EXPENSE_DELETED` | An expense is deleted |
| `BUDGET_ALERT_70` | Total spending reaches 70% of the total budget |
| `BUDGET_ALERT_90` | Total spending reaches 90% of the total budget |
| `BUDGET_EXCEEDED` | Total spending reaches or exceeds 100% of the total budget |
| `WEEKLY_REMINDER` | Automatic weekly reminder to upload expenses (Mondays 09:00) |

Threshold alerts only fire when a boundary is *crossed*, so the user is not notified repeatedly. Notifications appear both as live pop-ups (toasts) in the app and on the Notifications page, where they can be marked as read.

---

## Project structure

```
Verteilte-Systeme-Projekt/
├── docker-compose.yml          ← orchestrates all services
├── README.md
│
├── gateway-service/            ← NestJS API gateway
├── user-service/               ← Node.js user service
├── expenses/                   ← Django expenses service
├── budget-service/             ← NestJS + Prisma budget service
├── notifications-service/      ← Spring Boot notifications service
└── budget-frontend/            ← React + Vite frontend
```

---
