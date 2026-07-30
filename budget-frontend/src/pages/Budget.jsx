import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BudgetBar from "../components/BudgetBar";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getExpenses,
  notify,
} from "../api/client";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState([
    "Groceries",
    "Rent",
    "Transport",
    "Entertainment",
  ]);

  const [category, setCategory] = useState("Groceries");
  const [customCategory, setCustomCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);

    try {
      const [bud, exp] = await Promise.all([
        getBudgets(), 
        getExpenses().catch(() => [])
      ]);

      const loadedBudgets = Array.isArray(bud) ? bud : bud.data || [];
      const loadedExpenses = Array.isArray(exp) ? exp : exp.data || [];
      
      setBudgets(loadedBudgets);
      setExpenses(loadedExpenses);

      // Kategorien aus Budgets UND Ausgaben zusammenführen (ohne Duplikate)
      setCategories((prevCategories) => {
        const unique = new Set([...prevCategories]);
        
        loadedBudgets.forEach((b) => {
          if (b.category && b.category !== "Other") unique.add(b.category);
        });
        loadedExpenses.forEach((e) => {
          if (e.category && e.category !== "Other") unique.add(e.category);
        });

        return Array.from(unique);
      });

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
    setCustomCategory("");
    setLimit("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleNewBudgetClick() {
    if (showForm) {
      resetForm();
    } else {
      setCategory("Groceries");
      setCustomCategory("");
      setLimit("");
      setEditingId(null);
      setShowForm(true);
    }
  }

  function handleEditClick(budget) {
    if (categories.includes(budget.category)) {
      setCategory(budget.category);
      setCustomCategory("");
    } else {
      setCategory("Other");
      setCustomCategory(budget.category);
    }

    setLimit(budget.maxAmount);
    setEditingId(budget.id);
    setShowForm(true);
    setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const finalCategory = category === "Other" ? customCategory.trim() : category;

    if (!finalCategory) {
      setErrorMsg("Please specify a category name.");
      return;
    }

    const duplicateBudget = budgets.some(
      (b) => b.category.toLowerCase() === finalCategory.toLowerCase() && b.id !== editingId,
    );

    if (duplicateBudget) {
      setErrorMsg(`This budget for "${finalCategory}" already exists.`);
      return;
    }

    setCategories((prevCategories) => Array.from(new Set([...prevCategories, finalCategory])));

    const budgetData = {
      category: finalCategory,
      maxAmount: Number(limit),
    };

    try {
      if (editingId !== null) {
        await updateBudget(editingId, budgetData);
        notify("BUDGET_UPDATED", `Budget updated: ${finalCategory} — €${Number(limit).toFixed(2)}`);
      } else {
        await createBudget(budgetData);
        notify("BUDGET_CREATED", `New budget set: ${finalCategory} — €${Number(limit).toFixed(2)}`);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(editingId !== null ? "Couldn't edit the budget." : "Couldn't create the budget.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this budget?");
    if (!confirmed) return;

    try {
      const removed = budgets.find((b) => b.id === id);
      await deleteBudget(id);

      notify("BUDGET_DELETED", removed ? `Budget deleted: ${removed.category}` : "A budget was deleted.");

      if (editingId === id) resetForm();
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
          <p className="page-subtitle">Set limits, watch them in real time</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewBudgetClick}>
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
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== "Other") setCustomCategory("");
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other...</option>
              </select>
            </div>

            {category === "Other" && (
              <div className="field" style={{ marginTop: 10 }}>
                <label htmlFor="customCategory">Custom Category Name</label>
                <input
                  id="customCategory"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Subscriptions, Gym..."
                  required
                />
              </div>
            )}

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

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              {editingId !== null ? "Save changes" : "Save budget"}
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
          {budgets.map((budget) => {
            const spent = spentForCategory(budget.category);
            return (
              <div className="card" key={budget.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>{budget.category}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="row-amount">
                      €{spent.toFixed(2)} / €{Number(budget.maxAmount).toFixed(2)}
                    </span>
                    <button className="btn" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => handleEditClick(budget)}>Edit</button>
                    <button className="btn" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => handleDelete(budget.id)}>Delete</button>
                  </div>
                </div>
                <BudgetBar spent={spent} limit={Number(budget.maxAmount)} />
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}