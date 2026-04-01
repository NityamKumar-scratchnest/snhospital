import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"

const inputClass =
  "rounded-[10px] border border-scratch-border bg-scratch-surface px-3.5 py-2.5 font-sans text-scratch-text outline-none ring-scratch-accent/30 focus:ring-2"

export default function LoginPage() {
  const { user, initialized, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (initialized && user) {
    return <Navigate to={from && from.startsWith("/portal") ? from : "/portal"} replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email.trim(), password)
      navigate(from && from.startsWith("/portal") ? from : "/portal", {
        replace: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-scratch-bg bg-[radial-gradient(ellipse_at_20%_20%,rgba(20,184,166,0.15),transparent_50%)] px-5 py-8">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-scratch-border bg-scratch-surface p-8 shadow-[0_18px_50px_rgba(18,34,30,0.08)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to="/"
          className="mb-4 inline-block font-display text-xl font-semibold text-scratch-text no-underline hover:text-scratch-accent"
          data-cursor="pointer"
        >
          Scratchnest
        </Link>
        <h1 className="mb-2 text-3xl font-semibold">Patient portal</h1>
        <p className="mb-6 text-scratch-muted">
          Sign in for bills, labs, prescriptions, full visit notes, and revisit
          requests. Without a server, any email + password opens your demo portal.
        </p>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-sm font-semibold text-scratch-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-sm font-semibold text-scratch-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          {error && <p className="m-0 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full border border-transparent bg-gradient-to-br from-scratch-accent to-teal-600 py-3 text-base font-semibold text-white shadow-lg shadow-teal-800/20 transition hover:brightness-105 disabled:opacity-60"
            disabled={pending}
            data-cursor="pointer"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-scratch-muted">
          Offline mode: if the API is down, you still go straight to the portal — we
          create a local session from your email.
        </p>
        <p className="mt-6 text-sm">
          <Link
            to="/"
            className="font-medium text-scratch-accent no-underline hover:underline"
            data-cursor="pointer"
          >
            ← Back to clinic home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
