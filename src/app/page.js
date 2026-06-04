import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Smart Project & Task Collaboration System
          </p>
          <h1 className="text-4xl font-bold">
            Welcome to your project collaboration frontend
          </h1>
          <p className="text-lg text-slate-600">
            Use the links below to open the main starter pages.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4">
          <Link
            className="rounded-md bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            href={ROUTES.LOGIN}
          >
            Login
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-800 hover:bg-white"
            href={ROUTES.REGISTER}
          >
            Register
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-800 hover:bg-white"
            href={ROUTES.DASHBOARD}
          >
            Dashboard
          </Link>
        </nav>
      </section>
    </main>
  );
}
