"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!formData.password.trim()) {
      return "Password is required.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/register", formData);
      const userData = response.data?.data;
      const token = userData?.token;

      if (!token) {
        router.push("/login");
        return;
      }

      const { token: _token, ...userDataWithoutToken } = userData;

      saveToken(token);
      saveUser(userDataWithoutToken);
      router.push("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-sm text-slate-600">
            Register to start managing projects and tasks
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="name"
              name="name"
              onChange={handleInputChange}
              placeholder="Enter your name"
              type="text"
              value={formData.name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="email"
              name="email"
              onChange={handleInputChange}
              placeholder="Enter your email"
              type="email"
              value={formData.email}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="password"
              name="password"
              onChange={handleInputChange}
              placeholder="Enter your password"
              type="password"
              value={formData.password}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="role">
              Role
            </label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="role"
              name="role"
              onChange={handleInputChange}
              value={formData.role}
            >
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="member">member</option>
            </select>
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600 hover:text-blue-700" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
