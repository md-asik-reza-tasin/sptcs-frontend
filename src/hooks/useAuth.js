"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, logout } from "@/lib/auth";

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      const savedUser = getUser();

      if (!token) {
        router.push("/login");
        setLoading(false);
        return;
      }

      setUser(savedUser);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  function logoutUser() {
    logout();
    router.push("/login");
  }

  return {
    user,
    loading,
    logoutUser,
  };
}
