import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { EyeIcon, EyeOff, LockKeyhole, Mail } from "lucide-react";

const DEMO_EMAIL = "mishra@clinic.com";
const DEMO_PASSWORD = "123456";

export default function DoctorLoginPage() {
  const { user, initialized, loginDoctor } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [formPanelRef.current, ".right-hero-panel"],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  if (initialized && user) {
    return <Navigate to="/doctor" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await loginDoctor(email, password);
      navigate("/doctor");
    } catch {
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex items-center justify-center bg-slate-50 p-4"
    >
      <main className="w-full max-w-[1280px] bg-white rounded-[1.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-slate-200/60">
        <div
          ref={formPanelRef}
          className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16"
        >
          <div className="w-full max-w-md">
            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-10">
                {" "}
                <img
                  className="w-8 h-8 drop-shadow-sm"
                  src="./newLogo.png"
                  alt="Siro Care"
                />{" "}
                <span className="text-[1.1rem] font-bold tracking-tight text-slate-900">
                  {" "}
                  Siro Care{" "}
                </span>{" "}
              </div>
              <h1 className="text-[2.5rem] font-bold text-slate-900">
                Automate your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Clinic.
                </span>
              </h1>
              <p className="text-slate-500 mt-2">
                Manage your clinic effortlessly.
              </p>
            </header>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-[52px] rounded-xl border border-slate-200 bg-white pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-[52px] rounded-xl border border-slate-200 bg-white pl-12 pr-14 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* TEAL BUTTON */}
              <button
                disabled={pending}
                className="h-[52px] w-full rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-white font-semibold transition hover:shadow-lg"
              >
                {pending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* OR */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>

            {/* GOOGLE */}
            <button className="w-full h-[52px] rounded-xl border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>
        </div>

        {/* RIGHT PANEL (hidden on mobile) */}
        <div className="right-hero-panel relative hidden lg:flex flex-col justify-between overflow-hidden p-14 m-4 rounded-[1.25rem]">
          {" "}
          {/* Background Industrial Image */}{" "}
          <img
            src="./loginImage.png"
            alt="Advanced Clinical Technology"
            className="absolute inset-0 w-full h-full object-cover origin-center z-0"
          />{" "}
          {/* Cinematic Shadows (This solves the contrast issue natively) */}{" "}
          <div className="absolute inset-0 bg-slate-900/20 z-0 mix-blend-multiply" />{" "}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/60 to-transparent z-0" />{" "}
          {/* Top Row: AI Powered Tag */}{" "}
          <div className="relative z-10 flex justify-end">
            {" "}
            <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[0.7rem] font-bold text-white tracking-[0.2em] uppercase shadow-xl">
              {" "}
              AI Powered{" "}
            </span>{" "}
          </div>{" "}
          {/* Middle: Cinematic Headlines */}{" "}
          <div className="relative z-10 mb-auto mt-24 max-w-lg">
            {" "}
            <h2 className="text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-xl">
              {" "}
              Focus on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                {" "}
                healing.{" "}
              </span>{" "}
              <br /> We handle the rest.{" "}
            </h2>{" "}
          </div>{" "}
          {/* Bottom: True Frosted Glass Panel */}{" "}
          <div className="relative z-10 bg-white/10 border border-white/20 rounded-[1.5rem] backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            {" "}
            <div className="flex justify-between items-center mb-8 gap-4">
              {" "}
              <span className="flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                {" "}
                <span className="relative flex h-2 w-2">
                  {" "}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>{" "}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>{" "}
                </span>{" "}
                System Online{" "}
              </span>{" "}
              <span className="text-white/60 text-[0.7rem] font-bold tracking-[0.2em] uppercase">
                {" "}
                Demo Credentials{" "}
              </span>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {" "}
              <button
                onClick={() => setEmail(DEMO_EMAIL)}
                className="text-left group outline-none"
              >
                {" "}
                <p className="text-[0.7rem] font-bold text-white/50 uppercase tracking-widest mb-2">
                  {" "}
                  Email ID{" "}
                </p>{" "}
                <p className="font-mono text-[1rem] font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {" "}
                  {DEMO_EMAIL}{" "}
                </p>{" "}
              </button>{" "}
              <button
                onClick={() => setPassword(DEMO_PASSWORD)}
                className="text-left group outline-none"
              >
                {" "}
                <p className="text-[0.7rem] font-bold text-white/50 uppercase tracking-widest mb-2">
                  {" "}
                  Password{" "}
                </p>{" "}
                <p className="font-mono text-[1rem] font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {" "}
                  {DEMO_PASSWORD}{" "}
                </p>{" "}
              </button>{" "}
            </div>{" "}
            <div className="w-full h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent mb-6"></div>{" "}
            <div className="flex items-center justify-between gap-6">
              {" "}
              <div>
                {" "}
                <p className="text-[0.95rem] font-bold text-white">
                  {" "}
                  Test our Voice AI Assistant{" "}
                </p>{" "}
                <p className="text-sm font-medium text-white/70 mt-1.5">
                  {" "}
                  Call{" "}
                  <a
                    href="tel:+919262102445"
                    className="text-cyan-300 hover:text-cyan-200 transition-colors font-semibold tracking-wide"
                  >
                    {" "}
                    +91 92621 02445{" "}
                  </a>{" "}
                  to begin.{" "}
                </p>{" "}
              </div>{" "}
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg group hover:bg-white/20 transition-all cursor-pointer">
                {" "}
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />{" "}
                </svg>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      </main>
    </div>
  );
}
