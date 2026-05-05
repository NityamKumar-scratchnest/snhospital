import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";

const DEMO_EMAIL = "mishra@clinic.com";
const DEMO_PASSWORD = "123456";

// -- Simple Icon Components ---
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16v12H4V6zm0 0l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4l16 16M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-5.1M6.6 6.6C4.3 8.1 2 12 2 12s4 7 10 7c1.7 0 3.2-.4 4.5-1.1M17.8 17.8c-2.1 1.2-4.6 2.2-7.8 2.2-6 0-10-7-10-7a18.3 18.3 0 0 1 4.2-5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
// -----------------------------

export default function DoctorLoginPage() {
  const { user, initialized, loginDoctor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  // Smooth Entry Animation
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [formPanelRef.current, ".right-hero-panel"],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.1 }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  // Auth Redirects
  if (initialized && user) {
    if ((user as any).role === "patient") {
      return <Navigate to="/portal" replace />;
    }
    const to = from && from.startsWith("/doctor") ? from : "/doctor";
    return <Navigate to={to} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await loginDoctor(email.trim(), password)
      navigate(from && from.startsWith("/doctor") ? from : "/doctor", {
        replace: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Window Container */}
      <main className="relative z-10 w-full max-w-[1280px] h-[calc(100vh-4rem)] max-h-[800px] min-h-[650px] bg-white rounded-[1.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-slate-200/60">

        {/* Left Column: Form & Trust Indicators */}
        <div
          ref={formPanelRef}
          className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-y-auto custom-scrollbar font-['Plus_Jakarta_Sans']"
        >
          <div className="flex-1 flex flex-col justify-center">
            
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-10">
                <img className="w-8 h-8 drop-shadow-sm" src="./newLogo.png" alt="Siro Care" />
                <span className="text-[1.1rem] font-bold tracking-tight text-slate-900">
                  Siro Care
                </span>
              </div>

              <h1 className="text-[2.7rem] sm:text-[3.3rem] font-[800] tracking-[-0.03em] text-slate-900 leading-[1.05]">
                Automate your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                  clinic
                </span>
                .
              </h1>

              <p className="mt-4 text-[1rem] text-slate-500 max-w-[420px] leading-[1.6] font-[400]">
                Sign in to your clinical dashboard to manage appointments, AI assistants,
                and patient care effortlessly.
              </p>
            </header>

            <form className="flex flex-col gap-5 max-w-sm" onSubmit={onSubmit}>
              <div className="relative group">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mishra@clinic.com"
                  className="w-full h-[56px] rounded-xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-[0.95rem] text-slate-900 outline-none transition-all 
                  focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 hover:border-slate-300
                  placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="relative group">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[56px] rounded-xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-14 text-[0.95rem] text-slate-900 outline-none transition-all 
                  focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 hover:border-slate-300
                  placeholder:text-slate-400 font-medium"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500 mt-1 animate-pulse">{error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="h-[56px] mt-2 w-full rounded-xl 
                bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 
                text-[1rem] font-bold text-white tracking-wide
                transition-all duration-300 ease-out
                hover:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.6)] 
                hover:-translate-y-[2px] 
                active:scale-[0.98] 
                disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {pending ? "Authenticating..." : "Access Dashboard"}
              </button>
            </form>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-slate-200"></div>
              <p className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.2em]">
                ABDM Ready & Secure
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Hero Panel (THE FIX) */}
        <div className="right-hero-panel relative hidden lg:flex flex-col justify-between overflow-hidden p-14 m-4 rounded-[1.25rem]">

          {/* Background Industrial Image */}
          <img
            src="./loginImage.png"
            alt="Advanced Clinical Technology"
            className="absolute inset-0 w-full h-full object-cover origin-center z-0"
          />

          {/* Cinematic Shadows (This solves the contrast issue natively) */}
          <div className="absolute inset-0 bg-slate-900/20 z-0 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/60 to-transparent z-0" />
          
          {/* Top Row: AI Powered Tag */}
          <div className="relative z-10 flex justify-end">
            <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[0.7rem] font-bold text-white tracking-[0.2em] uppercase shadow-xl">
              AI Powered
            </span>
          </div>

          {/* Middle: Cinematic Headlines */}
          <div className="relative z-10 mb-auto mt-24 max-w-lg">
            <h2 className="text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-xl">
              Focus on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">healing.</span><br />
              We handle the rest.
            </h2>
          </div>

          {/* Bottom: True Frosted Glass Panel */}
          <div className="relative z-10 bg-white/10 border border-white/20 rounded-[1.5rem] backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-8 gap-4">
              <span className="flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                System Online
              </span>
              <span className="text-white/60 text-[0.7rem] font-bold tracking-[0.2em] uppercase">
                Demo Credentials
              </span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <button onClick={() => setEmail(DEMO_EMAIL)} className="text-left group outline-none">
                <p className="text-[0.7rem] font-bold text-white/50 uppercase tracking-widest mb-2">Email ID</p>
                <p className="font-mono text-[1rem] font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {DEMO_EMAIL}
                </p>
              </button>
              <button onClick={() => setPassword(DEMO_PASSWORD)} className="text-left group outline-none">
                <p className="text-[0.7rem] font-bold text-white/50 uppercase tracking-widest mb-2">Password</p>
                <p className="font-mono text-[1rem] font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {DEMO_PASSWORD}
                </p>
              </button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent mb-6"></div>

            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-[0.95rem] font-bold text-white">
                  Test our Voice AI Assistant
                </p>
                <p className="text-sm font-medium text-white/70 mt-1.5">
                  Call <a href="tel:+919262102445" className="text-cyan-300 hover:text-cyan-200 transition-colors font-semibold tracking-wide">+91 92621 02445</a> to begin.
                </p>
              </div>
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg group hover:bg-white/20 transition-all cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}