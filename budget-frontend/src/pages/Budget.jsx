import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BudgetBar from "../components/BudgetBar";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getExpenses,
} from "../api/client";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [category, setCategory] = useState("Groceries");
  const [limit, setLimit] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);

    try {
      const [bud, exp] = await Promise.all([
        getBudgets(),
        getExpenses(),
      ]);

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

  function spentForCategory(selectedCategory) {
    return expenses
      .filter((expense) => expense.category === selectedCategory)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  }

  function resetForm() {
    setCategory("Groceries");
    setLimit("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleNewBudgetClick() {
    if (showForm) {
      resetForm();
    } else {
      setCategory("Groceries");
      setLimit("");
      setEditingId(null);
      setShowForm(true);
    }
  }

  function handleEditClick(budget) {
    setCategory(budget.category);
    setLimit(budget.maxAmount);
    setEditingId(budget.id);
    setShowForm(true);
    setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
        const duplicateBudget = budgets.some(
      (budget) =>
        budget.category === category &&
        budget.id !== editingId,
    );

    if (duplicateBudget) {
      setErrorMsg(`this budget already exists`);
      return;
    }

    const budgetData = {
      category,
      maxAmount: Number(limit),
    };

    try {
      if (editingId !== null) {
        await updateBudget(editingId, budgetData);
      } else {
        await createBudget(budgetData);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(
        editingId !== null
          ? "Couldn't edit the budget."
          : "Couldn't create the budget.",
      );
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBudget(id);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setErrorMsg("Couldn't delete the budget.");
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">
            Set limits, watch them in real time
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleNewBudgetClick}
        >
          {showForm ? "Cancel" : "New budget"}
        </button>
      </div>

      {errorMsg && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderColor: "var(--rust)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--rust)",
              fontSize: 14,
            }}
          >
            {errorMsg}
          </p>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
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
                min="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {editingId !== null ? "Save changes" : "Save budget"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : budgets.length === 0 ? (
        <div className="card">
          <p className="empty-state">
            No budgets set yet. Create your first one above.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {budgets.map((budget) => {
            const spent = spentForCategory(budget.category);

            return (
              <div className="card" key={budget.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: 15,
                      margin: 0,
                    }}
                  >
                    {budget.category}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span className="row-amount">
                      €{spent.toFixed(2)} / €
                      {Number(budget.maxAmount).toFixed(2)}
                    </span>

                    <button
                      className="btn"
                      style={{
                        padding: "5px 10px",
                        fontSize: 12.5,
                      }}
                      onClick={() => handleEditClick(budget)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn"
                      style={{
                        padding: "5px 10px",
                        fontSize: 12.5,
                      }}
                      onClick={() => handleDelete(budget.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <BudgetBar
                  spent={spent}
                  limit={Number(budget.maxAmount)}
                />
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}