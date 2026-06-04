"use client";

import Loader from "@/components/common/Loader";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader text="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }

  return children;
}
