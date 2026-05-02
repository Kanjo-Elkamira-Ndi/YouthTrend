import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";

export function AuthShell({
  side,
  children,
}: {
  side: "signup" | "signin";
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Decorative panel */}
      <div className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.16_0.03_260)] via-[oklch(0.21_0.04_260)] to-[oklch(0.3_0.08_150)]" />
        <div className="bg-dots absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/"><Logo className="text-white" /></Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">Your campus, your voice.</h2>
            <p className="max-w-md text-white/75">A platform built for Cameroonian students, by Cameroonian students.</p>

            {side === "signup" ? (
              <div className="relative h-72">
                <FloatPreview className="left-0 top-0 rotate-[-6deg]" delay={0.1} title="🔥 Gist" line="The Great Wi-Fi Outage of Block C" />
                <FloatPreview className="left-16 top-20 rotate-[3deg]" delay={0.25} title="⚽ Sports" line="UB qualifies for Inter-Uni Finals" />
                <FloatPreview className="left-4 top-40 rotate-[-2deg]" delay={0.4} title="🎓 Academics" line="FMBS Final Year Results" />
              </div>
            ) : (
              <motion.figure
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur"
              >
                <p className="text-lg leading-relaxed">"YouthTrend is where I found out about everything happening on campus before anyone else."</p>
                <figcaption className="mt-4 text-sm text-white/70">— Amara K., UB</figcaption>
              </motion.figure>
            )}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-brand" /> 2,400+ students. 3 campuses. One platform.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>
          {children}
          <div className="mt-8 flex justify-center"><LanguageToggle /></div>
        </div>
      </div>
    </div>
  );
}

function FloatPreview({ className, delay, title, line }: { className: string; delay: number; title: string; line: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`absolute w-72 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur ${className}`}
    >
      <span className="text-xs font-semibold text-brand">{title}</span>
      <p className="mt-1 text-sm font-medium text-white">{line}</p>
    </motion.div>
  );
}

export function SocialButtons() {
  const items = [
    { id: "google", label: "Continue with Google", icon: <span className="font-bold text-[#4285F4]">G</span> },
    { id: "facebook", label: "Continue with Facebook", icon: <span className="font-bold text-[#1877F2]">f</span> },
    { id: "apple", label: "Continue with Apple", icon: <span></span> },
    { id: "x", label: "Continue with X", icon: <span className="font-bold">𝕏</span> },
  ];
  return (
    <div className="grid gap-2.5">
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:border-brand hover:bg-elevated"
        >
          <span className="grid h-5 w-5 place-items-center">{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
    </div>
  );
}
