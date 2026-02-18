import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ReactNode } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute check:", { user, loading });

  if (loading) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("User exists, allowing access");

  return <>{children}</>;
}
