import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { topics, users, currentUser } from "@/mock";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "yt_onboarded";
const SUGGESTED = users.slice(1, 5);

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [follows, setFollows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[520px] [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="0" {...slideAnim} className="text-center flex-1 flex flex-col items-center justify-center relative py-6">
                <Confetti />
                <Logo />
                <h2 className="text-2xl font-extrabold mt-6">Welcome to YouthTrend, {currentUser.name.split(" ")[0]}!</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Your campus content platform. Let's get you set up in 3 quick steps.
                </p>
                <Button className="mt-6" onClick={next}>Get Started →</Button>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="1" {...slideAnim} className="flex-1 flex flex-col py-2">
                <h2 className="text-xl font-bold">What do you want to read?</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose topics and we'll personalise your campus feed.</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {topics.map((t) => {
                    const sel = interests.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => setInterests((arr) => sel ? arr.filter((x) => x !== t) : [...arr, t])}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          sel ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-transparent hover:border-primary/40",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-auto pt-6">
                  <Button variant="ghost" onClick={next}>Skip</Button>
                  <Button onClick={next} disabled={interests.length === 0}>Next →</Button>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" {...slideAnim} className="flex-1 flex flex-col py-2">
                <h2 className="text-xl font-bold">Follow some writers to start</h2>
                <p className="text-sm text-muted-foreground mt-1">See their posts in your Following feed.</p>
                <div className="space-y-2 mt-5">
                  {SUGGESTED.map((u) => {
                    const f = follows[u.id];
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.campus} · {u.department}</div>
                        </div>
                        <Button
                          size="sm"
                          variant={f ? "default" : "outline"}
                          onClick={() => setFollows((x) => ({ ...x, [u.id]: !f }))}
                        >
                          {f ? "Following" : "Follow"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-auto pt-6">
                  <Button variant="ghost" onClick={next}>Skip</Button>
                  <Button onClick={next}>Next →</Button>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" {...slideAnim} className="text-center flex-1 flex flex-col items-center justify-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle2 className="h-20 w-20 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-extrabold mt-4">You're all set!</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Your feed is ready. Dive in and see what your campus is talking about.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs mt-6">
                  <Button onClick={finish}>Explore Your Feed →</Button>
                  <Link to="/upgrade" onClick={finish}>
                    <Button variant="ghost" className="w-full">Become a Writer</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-1.5 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === step ? "w-4 bg-primary" : "w-2 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const slideAnim = {
  initial: { x: 30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
  transition: { duration: 0.25 },
};

const Confetti = () => {
  const dots = Array.from({ length: 10 }).map((_, i) => ({
    i,
    x: Math.random() * 120 - 60,
    y: Math.random() * 120 - 60,
    color: ["bg-primary", "bg-emerald-400", "bg-emerald-300", "bg-primary/60"][i % 4],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <motion.span
          key={d.i}
          initial={{ scale: 0, opacity: 0, x: d.x, y: d.y }}
          animate={{ scale: 1, opacity: 1, y: d.y - 20 }}
          transition={{ delay: d.i * 0.05, duration: 0.6 }}
          className={cn("absolute top-1/2 left-1/2 h-2 w-2 rounded-full", d.color)}
        />
      ))}
    </div>
  );
};

export default OnboardingModal;
