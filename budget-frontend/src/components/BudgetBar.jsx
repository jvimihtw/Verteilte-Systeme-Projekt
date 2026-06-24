export default function BudgetBar({ spent, limit }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = spent > limit;
  const isWarning = !isOver && pct >= 80;

  const color = isOver ? "var(--rust)" : isWarning ? "var(--amber)" : "var(--green)";

  return (
    <div>
      <div className="budget-bar-track">
        <div
          className="budget-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 12.5,
          color: "var(--ink-soft)",
        }}
      >
        <span>{Math.round(pct)}% used</span>
        <span>
          {isOver
            ? `Over by €${(spent - limit).toFixed(2)}`
            : `€${(limit - spent).toFixed(2)} left`}
        </span>
      </div>
    </div>
  );
}
