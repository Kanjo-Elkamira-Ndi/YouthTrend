// src/pages/CheckInbox.tsx
// Shown after:  (a) ForgotPassword form submit → password reset link sent
//               (b) SignUp submit → email verification link sent
//               (c) Writer upgrade submit → upgrade request confirmation
// The `mode` query param drives the copy: ?mode=verify | ?mode=reset | ?mode=upgrade

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Mail, RefreshCw, ArrowLeft, CheckCircle2, ExternalLink,
} from "lucide-react";
import { useState } from "react";

// ── Mail provider shortcuts ──────────────────────────────────────────────────
const PROVIDERS = [
  { label: "Gmail",   url: "https://mail.google.com",  icon: "G" },
  { label: "Outlook", url: "https://outlook.com",       icon: "O" },
  { label: "Yahoo",   url: "https://mail.yahoo.com",    icon: "Y" },
];

// ── Component ────────────────────────────────────────────────────────────────
const CheckInbox = () => {
  const [params]    = useSearchParams();
  const mode        = params.get("mode") === "verify" ? "verify" : params.get("mode") === "upgrade" ? "upgrade" : "reset";
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const isVerify = mode === "verify";
  const isUpgrade = mode === "upgrade";

  const heading    = isVerify ? "Verify your email" : isUpgrade ? "Application received" : "Check your inbox";
  const subheading = isVerify
    ? "We sent a verification link to your university email. Click it to activate your account."
    : isUpgrade
    ? "Our editorial team will review your writer application within 3 business days. You'll get a notification when a decision is made."
    : "We sent a password reset link to your email. It expires in 15 minutes.";

  const handleResend = () => {
    if (cooldown) return;
    setResent(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30_000); // 30s cooldown
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="p-6 border-b border-border">
        <Logo />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center space-y-8"
        >
          {/* Animated envelope */}
          <div className="flex justify-center">
            <motion.div
              className="relative h-24 w-24"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Inner circle */}
              <div className="absolute inset-3 rounded-full bg-primary/15 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>

              {/* Floating tick badge */}
              <motion.div
                className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="h-4 w-4 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold">{heading}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              {subheading}
            </p>
          </div>

          {/* Info card */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3 text-left">
            {isUpgrade ? (
              <>
                <Step n={1} text="Our editorial team reviews your application." />
                <Step n={2} text="You'll receive a notification when a decision is made." />
                <Step n={3} text="If approved, you'll get the verified writer badge and access to analytics." />
              </>
            ) : (
              <>
                <Step n={1} text="Open your university email inbox." />
                <Step
                  n={2}
                  text={
                    isVerify
                      ? 'Find the email from YouthTrend with subject "Verify your account".'
                      : 'Find the email from YouthTrend with subject "Reset your password".'
                  }
                />
                <Step
                  n={3}
                  text={
                    isVerify
                      ? "Click the verification link to activate your account."
                      : "Click the reset link and choose a new password. Link expires in 15 minutes."
                  }
                />
              </>
            )}
          </div>

          {!isUpgrade && (
            <>
              {/* Open mail provider shortcuts */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Open your inbox
                </p>
                <div className="flex gap-3 justify-center">
                  {PROVIDERS.map((p) => (
                    <a
                      key={p.label}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-sm font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Resend */}
              <div className="space-y-3">
                {resent && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-primary font-medium flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Email resent successfully.
                  </motion.p>
                )}

                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleResend}
                  disabled={cooldown}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${cooldown ? "animate-spin" : ""}`} />
                  {cooldown ? "Resend in 30s..." : "Resend email"}
                </Button>
              </div>

              {/* Spam notice */}
              <p className="text-xs text-muted-foreground">
                Can't find it? Check your spam or junk folder.
              </p>
            </>
          )}

          {/* Back link */}
          <Link
            to={isUpgrade ? "/write/upgrade" : isVerify ? "/signup" : "/forgot-password"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isUpgrade ? "Back to application" : isVerify ? "Back to sign up" : "Back to forgot password"}
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

// ── Step helper ───────────────────────────────────────────────────────────────
const Step = ({ n, text }: { n: number; text: React.ReactNode }) => (
  <div className="flex gap-3 items-start">
    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
      {n}
    </span>
    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

export default CheckInbox;