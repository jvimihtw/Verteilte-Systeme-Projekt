import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getExpenses, createExpense, deleteExpense } from "../api/client";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadExpenses() {
    setLoading(true);
    try {
      const result = await getExpenses();
      setExpenses(result.data || []);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Couldn't load expenses. Is the expenses service running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await createExpense({
        title,
        amount: Number(amount),
        category,
        date: new Date().toISOString().split("T")[0],
      });
      setTitle("");
      setAmount("");
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setErrorMsg("Couldn't add the expense. Try again.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err) {
      setErrorMsg("Couldn't delete the expense.");
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Every euro, accounted for</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add expense"}
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
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly groceries"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="amount">Amount (€)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
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
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Save expense
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No expenses recorded yet.</p>
        ) : (
          expenses.map((expense) => (
            <div className="list-row" key={expense.id}>
              <div className="list-row-main">
                <div
                  className="row-icon"
                  style={{ background: "var(--green-soft)", color: "var(--green)" }}
                >
                  €
                </div>
                <div>
                  <p className="row-title">{expense.title}</p>
                  <p className="row-meta">
                    {expense.category} · {expense.date}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="row-amount">€{Number(expense.amount).toFixed(2)}</span>
                <button
                  className="btn"
                  style={{ padding: "5px 10px", fontSize: 12.5 }}
                  onClick={() => handleDelete(expense.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
