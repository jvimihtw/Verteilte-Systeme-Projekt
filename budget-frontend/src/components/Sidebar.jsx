import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: "◆" },
  { to: "/expenses", label: "Expenses", icon: "≡" },
  { to: "/budget", label: "Budget", icon: "▦" },
  { to: "/notifications", label: "Notifications", icon: "●" },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        Ledger<span>.</span>
      </div>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>
          {user?.name || "Guest"}
        </p>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-soft)",
            margin: "0 0 10px",
          }}
        >
          {user?.email || "Not signed in"}
        </p>
        <button className="btn" style={{ width: "100%" }} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
