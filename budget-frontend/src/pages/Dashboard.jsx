import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BudgetBar from "../components/BudgetBar";
import { getExpenses, getBudgets, getNotifications } from "../api/client";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [exp, bud, notif] = await Promise.all([
          getExpenses().catch(() => ({ data: [] })),
          getBudgets().catch(() => ({ data: [] })),
          getNotifications().catch(() => ({ data: [] })),
        ]);
        setExpenses(Array.isArray(exp) ? exp : exp.data || []);
        setBudgets(Array.isArray(bud) ? bud : bud.data || []);
        setNotifications(Array.isArray(notif) ? notif : notif.data || []);
      } catch (err) {
        setErrorMsg("Couldn't reach the gateway. Is docker compose running?");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.maxAmount || 0), 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your spending at a glance</p>
        </div>
      </div>

      {errorMsg && (
        <div
          className="card"
          style={{ marginBottom: 24, borderColor: "var(--rust)" }}
        >
          <p style={{ margin: 0, color: "var(--rust)", fontSize: 14 }}>
            {errorMsg}
          </p>
        </div>
      )}

      <div className="card-row">
        <div className="card">
          <p className="stat-label">Total spent</p>
          <p className="stat-value">€{totalSpent.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Total budget</p>
          <p className="stat-value green">€{totalBudget.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Unread notifications</p>
          <p className={"stat-value" + (unreadCount > 0 ? " rust" : "")}>
            {unreadCount}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p className="stat-label" style={{ marginBottom: 14 }}>
          Overall budget usage
        </p>
        <BudgetBar spent={totalSpent} limit={totalBudget || 1} />
      </div>

      <div className="card">
        <p className="stat-label" style={{ marginBottom: 4 }}>
          Recent expenses
        </p>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">
            No expenses yet. Add one from the Expenses page.
          </p>
        ) : (
          expenses.slice(0, 5).map((expense) => (
            <div className="list-row" key={expense.id}>
              <div className="list-row-main">
                <div
                  className="row-icon"
                  style={{ background: "var(--green-soft)", color: "var(--green)" }}
                >
                  €
                </div>
                <div>
                  <p className="row-title">{expense.title || expense.category}</p>
                  <p className="row-meta">{expense.date || "No date"}</p>
                </div>
              </div>
              <span className="row-amount">€{Number(expense.amount).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
