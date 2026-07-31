# Budget App Frontend (React + Vite)

A clean UI for the Budget App. Connects to your **gateway-service** on `http://localhost:3000`.

## Pages
- **Login / Register** — uses `user-service` via the gateway
- **Overview** — combined stats from expenses, budget, and notifications
- **Expenses** — add, view, delete expenses
- **Budget** — set monthly limits per category, see live usage bars
- **Notifications** — view budget alerts and weekly reminders

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

**Make sure your backend is running first:**
```bash
docker compose up --build
```

## Run with Docker

Add this service to your root `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: frontend
  ports:
    - "5173:5173"
  depends_on:
    - gateway-service
```

## Design notes

The interface follows a modern and minimal visual language, combining consistent typography, generous spacing, and subtle colors to improve readability and usability. The budget bar changes from green to amber to rust as spending increases, allowing users to quickly understand how close they are to their budget limit.

## Connecting to your gateway

All API calls go through `src/api/client.js`, which points to:
```js
const GATEWAY_URL = "http://localhost:3000";
```

If your gateway's routes differ from `/api/expenses`, `/api/budgets`, `/api/notifications`, `/login`, `/users` — update `client.js` to match what's actually in `gateway.controller.ts`.
