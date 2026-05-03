import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, PenSquare, TrendingUp } from "lucide-react";

// ── Hero carousel images ─────────────────────────────────────────────────────
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
];

// ── Stat definitions — green variants only ───────────────────────────────────
const STATS = [
  {
    icon: Users,
    value: "2.4k+",
    label: "Active Students",
    iconColor: "text-primary",
    iconBg:    "bg-primary/15",
    desktopPos: { top: "-1.5rem",  left: "-5.5rem" },
    delay: 0.4,
  },
  {
    icon: PenSquare,
    value: "1.2k+",
    label: "Stories Shared",
    iconColor: "text-emerald-400",
    iconBg:    "bg-emerald-400/15",
    desktopPos: { bottom: "3rem",  left: "-5.5rem" },
    delay: 0.6,
  },
  {
    icon: TrendingUp,
    value: "94%",
    label: "Returning Readers",
    iconColor: "text-green-300",
    iconBg:    "bg-green-300/15",
    desktopPos: { top: "40%",     right: "-5.5rem" },
    delay: 0.8,
  },
] as const;

// ── Carousel image block (shared by mobile + desktop) ────────────────────────
const CarouselImage = ({
  imgIdx,
  setImgIdx,
  height,
}: {
  imgIdx: number;
  setImgIdx: (i: number) => void;
  height: string;
}) => (
  <div
    className={`relative ${height} w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10`}
  >
    <AnimatePresence mode="wait">
      <motion.img
        key={imgIdx}
        src={HERO_IMAGES[imgIdx]}
        alt="Campus life"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1  }}
        exit={  { opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
    </AnimatePresence>

    {/* Dark-to-transparent overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

    {/* Bottom label */}
    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="font-medium">Campus moments</span>
    </div>

    {/* Dot indicators */}
    <div className="absolute bottom-4 right-4 flex gap-1.5">
      {HERO_IMAGES.map((_, i) => (
        <button
          key={i}
          onClick={() => setImgIdx(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === imgIdx ? "w-6 bg-primary" : "w-1.5 bg-white/40"
          }`}
        />
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const HeroSection = () => {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setImgIdx((i) => (i + 1) % HERO_IMAGES.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">

      {/* ── Atmosphere — green palette only ────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-background to-background pointer-events-none" />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:  Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top:    `${Math.random() * 100}%`,
              left:   `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.9, 0.1], scale: [1, 1.5, 1] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay:   Math.random() * 6,
            }}
          />
        ))}
      </div>

      {/* Nebula orbs — green only */}
      <motion.div
        className="absolute top-16 -left-48 h-[28rem] w-[28rem] rounded-full bg-green-800/25 blur-3xl pointer-events-none"
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 -right-48 h-[28rem] w-[28rem] rounded-full bg-emerald-700/20 blur-3xl pointer-events-none"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating rings — green only */}
      <motion.div
        className="absolute top-1/4 left-1/3 h-28 w-28 rounded-full border border-primary/20 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/3 h-44 w-44 rounded-full border border-green-600/15 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="container relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-24 pb-16 md:pt-32 md:pb-24">

        {/* ── Left: copy ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-6"
            whileHover={{ scale: 1.06 }}
          >
            <Sparkles className="h-3 w-3 animate-pulse" />
            Built for Cameroonian campuses
          </motion.span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.06]">
            Your Campus.{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              Your Gist.
            </motion.span>{" "}
            <br />
            {/* Green-only gradient — dark green → mid → light green */}
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
              Your Voice.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
            The platform where Cameroonian students share news, stories, and
            hot takes — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/write">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-6">
                  Start Writing
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/feed">
                <Button size="lg" variant="outline" className="h-12 px-6">
                  Explore Stories
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.p
            className="mt-5 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join{" "}
            <span className="font-semibold text-foreground">2,400+ students</span>{" "}
            across 3 campuses
          </motion.p>

          {/* Scroll indicator — desktop only */}
          <motion.div
            className="hidden lg:flex flex-col items-start gap-2 mt-14 ml-1"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
            <div className="h-10 w-5 rounded-full border-2 border-muted-foreground/30 flex justify-center">
              <motion.div
                className="h-2 w-1 rounded-full bg-primary mt-1"
                animate={{ y: [0, 18, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: carousel ─────────────────────────────────────────────────── */}

        {/* DESKTOP (lg+): orbiting stat cards around carousel */}
        <div
          className="relative w-80 xl:w-96 hidden lg:block"
          style={{ marginRight: "2.5rem" }}
        >
          {/* Decorative glow rings — green only */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-3xl border border-primary/20"
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 -m-8 rounded-3xl border border-green-600/10"
            animate={{ rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <CarouselImage
            imgIdx={imgIdx}
            setImgIdx={setImgIdx}
            height="h-[26rem] xl:h-[30rem]"
          />

          {/* Orbiting stat cards */}
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              className="absolute bg-background/85 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 shadow-xl"
              style={stat.desktopPos}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: stat.delay, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.06, y: -3 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-none">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
                    {stat.label}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MOBILE / TABLET (< lg): carousel + compact stat row */}
        <div className="lg:hidden w-full max-w-sm mx-auto flex flex-col gap-4">
          <CarouselImage
            imgIdx={imgIdx}
            setImgIdx={setImgIdx}
            height="h-64 sm:h-80"
          />

          {/* Stat cards in a 3-column grid row */}
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-background/80 backdrop-blur-xl rounded-xl px-2 py-3 border border-white/10 shadow-lg flex flex-col items-center text-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y:  0 }}
                transition={{ delay: stat.delay }}
              >
                <div
                  className={`h-8 w-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <div className="text-base font-extrabold leading-none">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};