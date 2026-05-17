import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

type Props = {
  postId: string;
  initialClaps?: number;
  initialMyClaps?: number;
  size?: "sm" | "lg";
};

type Particle = { id: number; x: number; y: number; rot: number };

export const ClapButton = ({ postId, initialClaps = 0, initialMyClaps = 0, size = "lg" }: Props) => {
  const [localClaps, setLocalClaps] = useState(initialClaps);
  const [myClaps, setMyClaps] = useState(initialMyClaps);
  const [particles, setParticles] = useState<Particle[]>([]);

  const dim = size === "lg" ? "h-20 w-20 text-4xl" : "h-12 w-12 text-2xl";
  const disabled = myClaps >= 50;

  const { mutate: clap } = useMutation({
    mutationFn: (count: number) =>
      api.post('/posts/' + postId + '/clap', { count }).then(unwrap<{ totalClaps: number; myClaps: number }>),
    onMutate: (count) => {
      const newMine = Math.min(50, myClaps + count);
      const delta = newMine - myClaps;
      setMyClaps(newMine);
      setLocalClaps(c => c + delta);
    },
    onSuccess: (data) => {
      setLocalClaps(data.totalClaps);
      setMyClaps(data.myClaps);
    },
  });

  const onClap = () => {
    if (disabled) return;
    clap(1);

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
        whileTap={disabled ? {} : { scale: 0.85 }}
        whileHover={disabled ? {} : { scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`relative rounded-full inline-flex items-center justify-center ${dim} ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-primary/10 hover:bg-primary/20'}`}
        disabled={disabled}
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
        <span className="font-bold text-foreground">{localClaps.toLocaleString()}</span> claps
        {myClaps > 0 && <span className="ml-1 text-xs">({myClaps})</span>}
      </div>
      {disabled && <span className="text-[10px] text-muted-foreground">Max 50 claps per post</span>}
    </div>
  );
};

export default ClapButton;
