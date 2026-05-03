import { ReactNode } from "react";import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";
import { BookOpen, Flame, Heart, MessageCircle, TrendingUp, Users } from "lucide-react";

// ── types ────────────────────────────────────────────────────────────────────
type Props = {
  children: ReactNode;
  decorativeHeading?: string;
  decorativeSubline?: string;
};

// ── floating element definitions ─────────────────────────────────────────────
// Each element has its own animation path so they all feel independent.
// x/y are % of the panel width/height. All motion loops infinitely.

const FLOATERS = [
  // ── Post preview card — top left area ────────────────────────────────────
  {
    id: "card-1",
    initialX: "8%",
    initialY: "18%",
    animate: { x: [0, 14, 4, 0], y: [0, -10, 6, 0] },
    duration: 18,
    delay: 0,
    content: (
      <div className="w-52 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://i.pravatar.cc/40?u=amara"
            className="h-6 w-6 rounded-full ring-1 ring-primary/60"
            alt=""
          />
          <div>
            <div className="text-[11px] font-bold text-white leading-none">Amara Ngono</div>
            <div className="text-[10px] text-white/50">UY1 · Gist</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-white leading-snug">
          "The Best Ndolé Spots Near Campus You Need to Try"
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/50">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> 1.2k</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 48</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> 3 min</span>
        </div>
      </div>
    ),
  },

  // ── Stat pill — upper right ───────────────────────────────────────────────
  {
    id: "stat-1",
    initialX: "62%",
    initialY: "12%",
    animate: { x: [0, -10, 5, 0], y: [0, 12, -5, 0] },
    duration: 14,
    delay: 2,
    content: (
      <div className="flex items-center gap-2 bg-primary/80 backdrop-blur-md text-white rounded-full px-4 py-2 shadow-xl border border-white/20">
        <Users className="h-4 w-4" />
        <span className="text-sm font-bold">2,400+ Students</span>
      </div>
    ),
  },

  // ── Trending card — mid left ──────────────────────────────────────────────
  {
    id: "trending",
    initialX: "5%",
    initialY: "52%",
    animate: { x: [0, 18, 6, 0], y: [0, -14, 4, 0] },
    duration: 22,
    delay: 4,
    content: (
      <div className="w-48 bg-black/45 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-wider mb-2">
          <Flame className="h-3 w-3" /> Trending now
        </div>
        {["UB Finals Recap", "Exam Survival Guide", "Campus Election 2026"].map((t, i) => (
          <div key={i} className="flex items-center gap-2 py-1 border-b border-white/10 last:border-0">
            <span className="text-[10px] font-bold text-white/30">{i + 1}</span>
            <span className="text-[11px] text-white/80 font-medium leading-tight">{t}</span>
          </div>
        ))}
      </div>
    ),
  },

  // ── Quote bubble — upper centre ───────────────────────────────────────────
  {
    id: "quote",
    initialX: "30%",
    initialY: "6%",
    animate: { x: [0, 8, -6, 0], y: [0, 16, 8, 0] },
    duration: 20,
    delay: 1.5,
    content: (
      <div className="max-w-[200px] bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xl">
        <p className="text-[11px] text-white/85 leading-relaxed italic">
          "Finally a space where my campus voice matters!"
        </p>
        <div className="mt-2 text-[10px] text-primary font-semibold">— Chanceline F. · Law · UY1</div>
      </div>
    ),
  },

  // ── Category tags row — lower right ──────────────────────────────────────
  {
    id: "tags",
    initialX: "52%",
    initialY: "72%",
    animate: { x: [0, -12, 4, 0], y: [0, -8, 12, 0] },
    duration: 17,
    delay: 3,
    content: (
      <div className="flex flex-wrap gap-1.5 max-w-[180px]">
        {["🔥 Gist", "📰 News", "⚽ Sports", "🎓 Academics"].map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-semibold bg-black/40 backdrop-blur-md border border-white/20 text-white/85 px-2.5 py-1 rounded-full shadow"
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  },

  // ── Second post card — lower left ────────────────────────────────────────
  {
    id: "card-2",
    initialX: "10%",
    initialY: "76%",
    animate: { x: [0, 10, -4, 0], y: [0, -18, 6, 0] },
    duration: 24,
    delay: 6,
    content: (
      <div className="w-52 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://i.pravatar.cc/40?u=blaise"
            className="h-6 w-6 rounded-full ring-1 ring-primary/60"
            alt=""
          />
          <div>
            <div className="text-[11px] font-bold text-white leading-none">Blaise Eyong</div>
            <div className="text-[10px] text-white/50">UB · Opinion</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-white leading-snug">
          "Why Every CS Student at UB Should Learn Rust in 2026"
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/50">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> 892</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 31</span>
        </div>
      </div>
    ),
  },

  // ── Active users pill — mid right ─────────────────────────────────────────
  {
    id: "stat-2",
    initialX: "60%",
    initialY: "45%",
    animate: { x: [0, -8, 14, 0], y: [0, 10, -8, 0] },
    duration: 19,
    delay: 5,
    content: (
      <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md text-white rounded-full px-4 py-2 shadow-xl border border-white/20">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">1.2k+ Stories</span>
      </div>
    ),
  },
];

// ── SplitScreen ───────────────────────────────────────────────────────────────
export const SplitScreen = ({
  children,
  decorativeHeading = "Your campus, your voice.",
  decorativeSubline = "Join the platform built for Cameroonian students.",
}: Props) => (
  <div className="min-h-screen grid lg:grid-cols-2">

    {/* ── LEFT: immersive photo panel ── */}
    <div className="relative hidden lg:block overflow-hidden">

      {/* Base photo — real students */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=1600&fit=crop&q=85"
        alt="Campus life"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Multi-layer overlay: dark base + green tint on top */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-green-900/30 to-black/60" />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vignette edges */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

      {/* Logo — pinned top-left */}
      <div className="absolute top-10 left-10 z-20">
        <Logo className="text-white" />
      </div>

      {/* ── Floating elements ── */}
      {FLOATERS.map((f) => (
        <motion.div
          key={f.id}
          className="absolute z-10"
          style={{ left: f.initialX, top: f.initialY }}
          animate={f.animate}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: f.delay,
          }}
        >
          {f.content}
        </motion.div>
      ))}

      {/* Bottom heading — pinned */}
      <div className="absolute bottom-10 left-10 right-10 z-20">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-3xl font-extrabold text-white leading-tight mb-2"
        >
          {decorativeHeading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/70 text-sm"
        >
          {decorativeSubline}
        </motion.p>

        {/* Campuses badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm text-white/90"
        >
          ✨ 2,400+ students · 3 campuses · One platform.
        </motion.div>
      </div>
    </div>

    {/* ── RIGHT: form slot ── */}
    <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo shown only on mobile (left panel hidden on mobile) */}
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        {children}
      </motion.div>
    </div>
  </div>
);