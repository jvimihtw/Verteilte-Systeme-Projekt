import axios from "axios";

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

export default api;
