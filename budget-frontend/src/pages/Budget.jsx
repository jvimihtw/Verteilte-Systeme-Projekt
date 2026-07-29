import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BudgetBar from "../components/BudgetBar";
import {
  getBudgets,
  createBudget,
  getExpenses,
  notify,
} from "../api/client";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("Groceries");
  const [limit, setLimit] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [bud, exp] = await Promise.all([getBudgets(), getExpenses()]);
      setBudgets(Array.isArray(bud) ? bud : bud.data || []);
      setExpenses(Array.isArray(exp) ? exp : exp.data || []);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Couldn't load your data. Is the microservice running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function spentForCategory(cat) {
    return expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await createBudget({
        category: category,
        maxAmount: Number(limit),
      });

      // 🔔 Notify: a new budget was created
      notify(
        "BUDGET_CREATED",
        `New budget set: ${category} — €${Number(limit).toFixed(2)}`,
      );

      setLimit("");
      setShowForm(false);
      loadData();
    } catch (err) {
      setErrorMsg("Couldn't create the budget. Please try again.");
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Set limits, watch them in real time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New budget"}
        </button>
      </div>

      {errorMsg && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--rust)" }}>
          <p style={{ margin: 0, color: "var(--rust)", fontSize: 14 }}>{errorMsg}</p>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleAdd}>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Groceries</option>
                <option>Rent</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="limit">Monthly limit (€)</label>
              <input
                id="limit"
                type="number"
                step="0.01"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Save budget
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : budgets.length === 0 ? (
        <div className="card">
          <p className="empty-state">No budgets set yet. Create your first one above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {budgets.map((b) => {
            const spent = spentForCategory(b.category);
            return (
              <div className="card" key={b.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>
                    {b.category}
                  </p>
                  <span className="row-amount">
                    €{spent.toFixed(2)} / €{Number(b.maxAmount).toFixed(2)}
                  </span>
                </div>
                <BudgetBar spent={spent} limit={Number(b.maxAmount)} />
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
