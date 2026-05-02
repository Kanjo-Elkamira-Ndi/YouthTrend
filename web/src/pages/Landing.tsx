import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, PenSquare, Users, Sparkles, Globe, Shield, Heart } from "lucide-react";
import { posts, campuses } from "@/mock";
import { PostCard } from "@/components/feed/PostCard";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { useState } from "react";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { CATEGORIES } from "@/lib/constants";

const Landing = () => {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? posts.slice(0, 6) : posts.filter((p) => p.category === cat).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 yt-gradient-hero pointer-events-none" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-link/10 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />
        {/* Floating mock cards */}
        <div className="absolute hidden lg:block top-24 right-8 w-56 yt-card p-3 opacity-30 animate-drift">
          <div className="aspect-[16/10] rounded bg-muted mb-2" />
          <div className="h-2 w-3/4 bg-muted rounded mb-1" />
          <div className="h-2 w-1/2 bg-muted rounded" />
        </div>
        <div className="absolute hidden lg:block bottom-12 left-8 w-48 yt-card p-3 opacity-20 animate-drift" style={{ animationDelay: "2s" }}>
          <div className="aspect-[16/10] rounded bg-muted mb-2" />
          <div className="h-2 w-3/4 bg-muted rounded" />
        </div>

        <div className="container relative pt-20 pb-24 md:pt-32 md:pb-36 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-6">
              <Sparkles className="h-3 w-3" /> Built for Cameroonian campuses
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Your Campus. Your Gist. <span className="text-primary">Your Voice.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The platform where Cameroonian students share news, stories, and hot takes — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/write"><Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-6">Start Writing <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/feed"><Button size="lg" variant="outline" className="h-12 px-6">Explore Stories</Button></Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Join <span className="font-semibold text-foreground">2,400+ students</span> across 3 campuses</p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20">
        <SectionHeading eyebrow="How it works" title="From signup to spotlight in three steps" />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", icon: Users, title: "Join Your Campus", text: "Sign up with your university email. Your campus feed is waiting." },
            { n: "02", icon: BookOpen, title: "Read & Discover", text: "Browse news, gist, and articles from your campus and beyond." },
            { n: "03", icon: PenSquare, title: "Write & Shine", text: "Share your voice. Publish stories that matter to your generation." },
          ].map((s) => (
            <div key={s.n} className="yt-card yt-card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center"><s.icon className="h-5 w-5" /></span>
                <span className="text-3xl font-extrabold text-muted-foreground/30">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <SectionHeading eyebrow="Trending now" title="What students are reading this week" align="left" />
          <Link to="/explore" className="hidden sm:inline-flex items-center text-sm text-primary font-semibold hover:underline">See All Trending →</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
          {posts.slice(0, 6).map((p) => {
            const cat = CATEGORIES.find((c) => c.name === p.category);
            return (
              <Link to={`/post/${p.id}`} key={p.id} className="snap-start shrink-0 w-72 yt-card yt-card-hover overflow-hidden">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={p.cover} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary">{cat?.emoji} {p.category}</span>
                  <h4 className="font-bold mt-1 line-clamp-2 leading-snug">{p.title}</h4>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <AuthorBadge user={p.author} size="sm" showCampus={false} />
                    <span>👏 {(p.claps / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CAMPUS SPOTLIGHT */}
      <section className="container py-16">
        <SectionHeading eyebrow="Campuses" title="Explore your school. Discover others." />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {campuses.map((c) => (
            <div key={c.id} className="yt-card yt-card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-12 w-12 rounded-xl bg-primary/10 text-2xl inline-flex items-center justify-center">{c.emoji}</span>
                <div>
                  <h3 className="font-bold leading-tight">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.members.toLocaleString()} members</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Latest: "{posts.find((p) => p.campus === c.short)?.title || "Welcome to the platform"}"</p>
              <Button variant="outline" size="sm" className="w-full">Explore Campus →</Button>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-16">
        <SectionHeading eyebrow="Categories" title="Find what your campus is talking about" />
        <div className="mt-8 flex justify-center"><CategoryPills active={cat} onChange={setCat} /></div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      {/* WHY YOUTHTREND */}
      <section className="container py-20">
        <SectionHeading eyebrow="Why YouthTrend" title="Built for students. By students." />
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {[
            { icon: Users, title: "Campus-Scoped Feeds", text: "See what's happening on your campus, not someone else's." },
            { icon: Globe, title: "Bilingual", text: "Read and write in English or French. C'est votre choix." },
            { icon: Shield, title: "Student Moderation", text: "Safe spaces, enforced by your campus community." },
            { icon: Heart, title: "Real Student Voices", text: "No bots. No brands. Just authentic youth content." },
          ].map((f, i) => (
            <div key={i} className="yt-card p-6 flex gap-4">
              <span className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0"><f.icon className="h-5 w-5" /></span>
              <div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-16">
        <SectionHeading eyebrow="Voices" title="Loved by students across Cameroon" />
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { quote: "YouthTrend is where I found out about everything happening on campus before anyone else.", user: "Amara K.", sub: "Computer Science · UB" },
            { quote: "Finally, a space where my opinions don't get drowned in random Facebook groups.", user: "Blaise E.", sub: "Business · IUBS" },
            { quote: "I published my first article here and got 1,200 claps in two days. Wahala!", user: "Chanceline F.", sub: "Law · UY1" },
          ].map((t, i) => (
            <div key={i} className="yt-card p-6">
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                <img src={`https://i.pravatar.cc/100?u=test${i}`} className="h-9 w-9 rounded-full" alt={t.user} />
                <div>
                  <div className="text-sm font-semibold">{t.user}</div>
                  <div className="text-xs text-muted-foreground">{t.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="container py-16">
        <div className="rounded-3xl yt-gradient-cta p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <h2 className="relative text-3xl md:text-5xl font-extrabold tracking-tight">Ready to join the conversation?</h2>
          <p className="relative mt-4 text-primary-foreground/80 max-w-xl mx-auto">Your campus needs your voice. Your story matters.</p>
          <Link to="/signup" className="relative inline-block mt-8">
            <Button size="lg" variant="secondary" className="h-12 px-6 bg-background text-foreground hover:bg-background/90">
              Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) => (
  <div className={align === "center" ? "text-center" : ""}>
    <div className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</div>
    <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
  </div>
);

export default Landing;
