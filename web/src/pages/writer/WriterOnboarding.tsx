import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle2, PenSquare, Sparkles, Trophy, Users } from "lucide-react";

const STEPS = [
  {
    icon: Trophy,
    title: "Welcome, Verified Writer!",
    body: "You now have access to advanced tools that help your stories reach more students across Cameroonian campuses.",
  },
  {
    icon: PenSquare,
    title: "A richer editor",
    body: "Use the upgraded composer with cover images, code blocks, callouts, and scheduled publishing.",
  },
  {
    icon: Sparkles,
    title: "Analytics & insights",
    body: "Track views, claps, completion rates, and your audience by campus — right from your dashboard.",
  },
  {
    icon: Users,
    title: "Community guidelines",
    body: "Verified writers set the tone. Be accurate, be kind, credit sources, and elevate campus voices.",
  },
  {
    icon: BookOpen,
    title: "You're all set",
    body: "Open your dashboard to write your first verified post or browse drafts you've already started.",
  },
];

const WriterOnboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const Step = STEPS[step];
  const Icon = Step.icon;
  const last = step === STEPS.length - 1;

  return (
    <AppShell hideRight>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="p-8 text-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
                className="h-20 w-20 mx-auto rounded-2xl bg-primary/15 inline-flex items-center justify-center mb-5"
              >
                <Icon className="h-10 w-10 text-primary" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{Step.title}</h1>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">{Step.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/feed")}>Skip</Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
              )}
              {last ? (
                <Button onClick={() => navigate("/writer/posts")}>
                  <CheckCircle2 className="h-4 w-4" /> Open dashboard
                </Button>
              ) : (
                <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
              )}
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </AppShell>
  );
};

export default WriterOnboarding;
