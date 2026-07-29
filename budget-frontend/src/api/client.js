import axios from "axios";
import { showToast } from "../context/ToastContext";

// All requests go through the gateway, which forwards to the right service.
// Gateway runs on port 3000 — see gateway-service/src/gateway/gateway.controller.ts
const GATEWAY_URL = "http://localhost:3000";
const USER_SERVICE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Axios interceptor ───────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth / Users ────────────────────────────────────────────────────────────
export const login = (email, password) =>
  axios.post(`${USER_SERVICE_URL}/login`, { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  axios.post(`${USER_SERVICE_URL}/users`, { name, email, password }).then((r) => r.data);

// ── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenses = () => api.get("/api/expenses").then((r) => r.data);

export const createExpense = (expense) =>
  api.post("/api/expenses", expense).then((r) => r.data);

//edit
export const updateExpense = (id, expense) =>
  api.put(`/api/expenses/${id}`, expense).then((r) => r.data);

export const deleteExpense = (id) =>
  api.delete(`/api/expenses/${id}`).then((r) => r.data);

// ── Budget ───────────────────────────────────────────────────────────────────
export const getBudgets = () => api.get("/api/budgets").then((r) => r.data);

export const createBudget = (budget) =>
  api.post("/api/budgets", budget).then((r) => r.data);

export const updateBudget = (id, budget) =>
  api.put(`/api/budgets/${id}`, budget).then((r) => r.data);

// ── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = (userId) =>
  api
    .get("/api/notifications", { params: userId ? { userId } : {} })
    .then((r) => r.data);

export const markNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read`).then((r) => r.data);

// Maps notification types to a toast tone (colour).
const toneForType = (type) => {
  if (type === "BUDGET_EXCEEDED" || type.endsWith("_DELETED")) return "alert";
  if (type === "BUDGET_ALERT_70" || type === "BUDGET_ALERT_90") return "warning";
  return "info";
};

// Fire-and-forget notification sender. Never blocks or breaks the main action:
// if the notifications service is down, the create/edit/delete still succeeds.
export const notify = (type, message, userId = 1) => {
  // 1. Show an immediate pop-up so the user sees it without leaving the page
  showToast(message, toneForType(type));

  // 2. Persist it to the notifications service (fire-and-forget)
  api
    .post("/api/notifications", { type, message, userId })
    .catch((err) => console.warn("notification failed:", err.message));
};

// Given the previous total-spent %, the new %, and the budget limit,
// fire threshold notifications when a boundary is crossed (70 / 90 / 100).
// Called after adding an expense so we only alert on the *transition*.
export const checkThresholds = (prevPct, newPct) => {
  const crossed = (mark) => prevPct < mark && newPct >= mark;

  if (crossed(100)) {
    notify("BUDGET_EXCEEDED", "You've spent 100% of your total budget!");
  } else if (crossed(90)) {
    notify("BUDGET_ALERT_90", "You've reached 90% of your total budget.");
  } else if (crossed(70)) {
    notify("BUDGET_ALERT_70", "You've reached 70% of your total budget.");
  }
};

export default api;