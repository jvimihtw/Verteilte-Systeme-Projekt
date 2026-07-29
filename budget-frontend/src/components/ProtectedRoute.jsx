import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, allow access to the protected child routes
  return <Outlet />;
}