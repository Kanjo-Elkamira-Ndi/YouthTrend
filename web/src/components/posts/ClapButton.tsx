import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  initial?: number;
  size?: "sm" | "lg";
};

type Particle = { id: number; x: number; y: number; rot: number };

export const ClapButton = ({ initial = 0, size = "lg" }: Props) => {
  const [claps, setClaps] = useState(initial);
  const [particles, setParticles] = useState<Particle[]>([]);

  const dim = size === "lg" ? "h-20 w-20 text-4xl" : "h-12 w-12 text-2xl";

  const onClap = () => {
    setClaps((c) => c + 1);
    const newOnes: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -20 - Math.random() * 50,
      rot: (Math.random() - 0.5) * 60,
    }));
    setParticles((p) => [...p, ...newOnes]);
    setTimeout(
      () => setParticles((p) => p.filter((x) => !newOnes.some((n) => n.id === x.id))),
      800,
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={onClap}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`relative rounded-full bg-primary/10 hover:bg-primary/20 inline-flex items-center justify-center ${dim}`}
      >
        <span>👏</span>
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.5, rotate: p.rot }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute text-lg pointer-events-none"
            >
              ✨
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>
      <div className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{claps.toLocaleString()}</span> claps
      </div>
    </div>
  );
};

export default ClapButton;
