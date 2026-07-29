import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getBudgets,
  notify,
  checkThresholds,
} from "../api/client";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadExpenses() {
    setLoading(true);

    try {
      const result = await getExpenses();
      setExpenses(Array.isArray(result) ? result : result.data || []);
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

  function resetForm() {
    setTitle("");
    setAmount("");
    setCategory("Groceries");
    setEditingId(null);
    setShowForm(false);
  }

  function handleAddClick() {
    if (showForm) {
      resetForm();
    } else {
      setEditingId(null);
      setTitle("");
      setAmount("");
      setCategory("Groceries");
      setShowForm(true);
    }
  }

  function handleEditClick(expense) {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setShowForm(true);
    setErrorMsg("");
  }

  // Sum a list of expenses
  function sumExpenses(list) {
    return list.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const expenseData = {
      title,
      amount: Number(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      if (editingId !== null) {
        await updateExpense(editingId, expenseData);
        // 🔔 Notify: expense edited
        notify("EXPENSE_UPDATED", `Expense updated: ${title} — €${Number(amount).toFixed(2)}`);
        resetForm();
        await loadExpenses();
      } else {
        // Work out spend % before and after, so we can alert on threshold crossings.
        const budgetsResp = await getBudgets().catch(() => []);
        const budgets = Array.isArray(budgetsResp) ? budgetsResp : budgetsResp.data || [];
        const totalBudget = budgets.reduce(
          (sum, b) => sum + Number(b.maxAmount || 0),
          0,
        );

        const spentBefore = sumExpenses(expenses);
        const spentAfter = spentBefore + Number(amount);

        await createExpense(expenseData);
        // 🔔 Notify: expense created
        notify("EXPENSE_CREATED", `New expense: ${title} — €${Number(amount).toFixed(2)}`);

        // 🔔 Notify: threshold crossings (only fires when a boundary is passed)
        if (totalBudget > 0) {
          const prevPct = (spentBefore / totalBudget) * 100;
          const newPct = (spentAfter / totalBudget) * 100;
          checkThresholds(prevPct, newPct);
        }

        resetForm();
        await loadExpenses();
      }
    } catch (err) {
      setErrorMsg(
        editingId !== null
          ? "Couldn't edit the expense."
          : "Couldn't add the expense.",
      );
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const removed = expenses.find((e) => e.id === id);
      await deleteExpense(id);

      // 🔔 Notify: expense deleted
      notify(
        "EXPENSE_DELETED",
        removed
          ? `Expense deleted: ${removed.title} — €${Number(removed.amount).toFixed(2)}`
          : "An expense was deleted.",
      );

      if (editingId === id) {
        resetForm();
      }

      await loadExpenses();
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

        <button className="btn btn-primary" onClick={handleAddClick}>
          {showForm ? "Cancel" : "Add expense"}
        </button>
      </div>

      {errorMsg && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: "var(--rust)" }}
        >
          <p style={{ margin: 0, color: "var(--rust)", fontSize: 14 }}>
            {errorMsg}
          </p>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
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
                min="0"
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {editingId !== null ? "Save changes" : "Save expense"}
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
                  style={{
                    background: "var(--green-soft)",
                    color: "var(--green)",
                  }}
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span className="row-amount">
                  €{Number(expense.amount).toFixed(2)}
                </span>

                <button
                  className="btn"
                  style={{ padding: "5px 10px", fontSize: 12.5 }}
                  onClick={() => handleEditClick(expense)}
                >
                  Edit
                </button>

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
