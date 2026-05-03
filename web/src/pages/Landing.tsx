import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, PenSquare, Users, Globe, Shield, Heart, ThumbsUp,
} from "lucide-react";
import { posts, campuses } from "@/mock";
import { PostCard } from "@/components/feed/PostCard";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { useState } from "react";
import { CATEGORIES, CAMPUS_ICONS } from "@/lib/constants";

// ── Sub-components ───────────────────────────────────────────────────────────
import { HeroSection }       from "@/components/landing/HeroSection";
import { SectionHeading, TestimonialsSection }    from "@/components/landing/SectionHeading";

// ── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { n: "01", icon: Users,     title: "Join Your Campus",  text: "Sign up with your university email. Your campus feed is waiting." },
  { n: "02", icon: BookOpen,  title: "Read & Discover",   text: "Browse news, gist, and articles from your campus and beyond." },
  { n: "03", icon: PenSquare, title: "Write & Shine",     text: "Share your voice. Publish stories that matter to your generation." },
];

const FEATURES = [
  { icon: Users,  title: "Campus-Scoped Feeds",   text: "See what's happening on your campus, not someone else's." },
  { icon: Globe,  title: "Bilingual",              text: "Read and write in English or French. C'est votre choix." },
  { icon: Shield, title: "Student Moderation",     text: "Safe spaces, enforced by your campus community." },
  { icon: Heart,  title: "Real Student Voices",    text: "No bots. No brands. Just authentic youth content." },
];

// ── Page ─────────────────────────────────────────────────────────────────────
const Landing = () => {
  const [cat, setCat] = useState("All");
  const filtered =
    cat === "All"
      ? posts.slice(0, 6)
      : posts.filter((p) => p.category === cat).slice(0, 6);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── HOW IT WORKS ── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container py-20"
      >
        <SectionHeading eyebrow="How it works" title="From signup to spotlight in three steps" />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((s, idx) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              whileHover={{ y: -8 }}
              className="yt-card yt-card-hover p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold text-muted-foreground/30">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TRENDING ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container py-12"
      >
        <div className="flex items-end justify-between mb-6">
          <SectionHeading eyebrow="Trending now" title="What students are reading this week" align="left" />
          <Link to="/explore" className="hidden sm:inline-flex items-center text-sm text-primary font-semibold hover:underline">
            See All Trending →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
          {posts.slice(0, 6).map((p, idx) => {
            const catMeta = CATEGORIES.find((c) => c.name === p.category);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/post/${p.id}`}
                  className="snap-start shrink-0 w-72 yt-card yt-card-hover overflow-hidden block"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                      {catMeta && <catMeta.icon className="h-3.5 w-3.5" />}
                      {p.category}
                    </span>
                    <h4 className="font-bold mt-1 line-clamp-2 leading-snug">{p.title}</h4>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.author.name}</span>
                      <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{(p.claps / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── CAMPUS SPOTLIGHT ── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container py-16"
      >
        <SectionHeading eyebrow="Campuses" title="Explore your school. Discover others." />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {campuses.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="yt-card yt-card-hover p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                >
                  {(() => {
                    const CampusIcon = CAMPUS_ICONS[c.short] ?? CATEGORIES[0].icon;
                    return <CampusIcon className="h-6 w-6" />;
                  })()}
                </motion.span>
                <div>
                  <h3 className="font-bold leading-tight">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.members.toLocaleString()} members</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Latest: "{posts.find((p) => p.campus === c.short)?.title || "Welcome to the platform"}"
              </p>
              <Button variant="outline" size="sm" className="w-full">Explore Campus →</Button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CATEGORIES ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container py-16"
      >
        <SectionHeading eyebrow="Categories" title="Find what your campus is talking about" />
        <div className="mt-8 flex justify-center">
          <CategoryPills active={cat} onChange={setCat} />
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── WHY YOUTHTREND ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container py-20"
      >
        <SectionHeading eyebrow="Why YouthTrend" title="Built for students. By students." />
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="yt-card p-6 flex gap-4"
            >
              <span className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── CTA BANNER ── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="container py-16"
      >
        <div className="rounded-3xl yt-gradient-cta p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
          {/* dot-grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <motion.div
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <h2 className="relative text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to join the conversation?
          </h2>
          <p className="relative mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Your campus needs your voice. Your story matters.
          </p>
          <motion.div
            className="relative inline-block mt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-6 bg-background text-foreground hover:bg-background/90"
              >
                Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Landing;