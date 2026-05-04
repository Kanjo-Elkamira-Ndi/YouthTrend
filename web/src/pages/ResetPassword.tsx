// src/pages/ResetPassword.tsx
import { SplitScreen } from "@/components/auth/SplitScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Password strength helper ─────────────────────────────────────────────────
type Strength = { label: string; color: string; width: string; met: boolean[] };

function getStrength(pw: string): Strength {
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ];
  const score = checks.filter(Boolean).length;
  const map: Record<number, { label: string; color: string; width: string }> = {
    0: { label: "Too short",  color: "bg-destructive",    width: "w-0"    },
    1: { label: "Weak",       color: "bg-red-500",        width: "w-1/4"  },
    2: { label: "Fair",       color: "bg-amber-500",      width: "w-2/4"  },
    3: { label: "Good",       color: "bg-emerald-400",    width: "w-3/4"  },
    4: { label: "Strong",     color: "bg-primary",        width: "w-full" },
  };
  return { ...map[score], met: checks };
}

const RULE_LABELS = [
  "At least 8 characters",
  "One uppercase letter",
  "One number",
  "One special character",
];

// ── Component ────────────────────────────────────────────────────────────────
const ResetPassword = () => {
  const [show, setShow]       = useState(false);
  const [showC, setShowC]     = useState(false);
  const [pw, setPw]           = useState("");
  const [confirm, setConfirm] = useState("");
  const nav = useNavigate();

  const strength = useMemo(() => getStrength(pw), [pw]);
  const match    = pw.length > 0 && confirm.length > 0 && pw === confirm;
  const canSubmit = strength.met.every(Boolean) && match;

  return (
    <SplitScreen
      decorativeHeading="Almost there."
      decorativeSubline="Set a strong new password and get back to your campus feed."
      image="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&h=1600&fit=crop&q=85"
      quote={{
        text: "Took me less than a minute. Straight back to reading campus gist.",
        author: "Fatima N.",
        meta: "Economics · IUBS",
        avatar: "https://i.pravatar.cc/40?u=fatima",
      }}
    >
      <div className="space-y-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <KeyRound className="h-7 w-7 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-extrabold">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password you haven't used before.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (canSubmit) nav("/signin"); }}
          className="space-y-5"
        >
          {/* New password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">New Password</Label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {pw.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-1"
              >
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full transition-all duration-500", strength.color)}
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Strength:{" "}
                    <span className={cn("font-semibold", strength.color.replace("bg-", "text-"))}>
                      {strength.label}
                    </span>
                  </span>
                </div>

                {/* Rules checklist */}
                <div className="grid grid-cols-2 gap-1 pt-1">
                  {RULE_LABELS.map((rule, i) => (
                    <div key={rule} className="flex items-center gap-1.5">
                      {strength.met[i] ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-[11px]",
                          strength.met[i] ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showC ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={cn(
                  confirm.length > 0 && !match && "border-red-500 focus-visible:ring-red-500/20",
                  confirm.length > 0 &&  match && "border-primary focus-visible:ring-primary/20",
                )}
              />
              <button
                type="button"
                onClick={() => setShowC(!showC)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showC ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirm.length > 0 && !match && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Passwords do not match
              </p>
            )}
            {match && (
              <p className="text-xs text-primary flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-11 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset Password
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Back to{" "}
          <Link to="/signin" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </SplitScreen>
  );
};

export default ResetPassword;