import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getNotifications, markNotificationRead } from "../api/client";

const typeBadge = {
  BUDGET_ALERT_80: { label: "80% reached", className: "badge-amber" },
  BUDGET_EXCEEDED: { label: "Over budget", className: "badge-rust" },
  WEEKLY_REMINDER: { label: "Reminder", className: "badge-green" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadNotifications() {
    setLoading(true);
    try {
      const result = await getNotifications();
      setNotifications(result.data || []);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Couldn't load notifications. Is notifications-service running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      setErrorMsg("Couldn't update the notification.");
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Budget alerts and reminders</p>
        </div>
      </div>

      {errorMsg && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--rust)" }}>
          <p style={{ margin: 0, color: "var(--rust)", fontSize: 14 }}>{errorMsg}</p>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="empty-state">No notifications yet.</p>
        ) : (
          notifications.map((n) => {
            const badge = typeBadge[n.type] || { label: n.type, className: "badge-green" };
            return (
              <div className="list-row" key={n.id}>
                <div className="list-row-main">
                  <div
                    className="row-icon"
                    style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
                  >
                    ●
                  </div>
                  <div>
                    <p className="row-title">{n.message}</p>
                    <p className="row-meta">
                      <span className={"badge " + badge.className}>{badge.label}</span>
                    </p>
                  </div>
                </div>
                {!n.read && (
                  <button
                    className="btn"
                    style={{ padding: "5px 10px", fontSize: 12.5 }}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
