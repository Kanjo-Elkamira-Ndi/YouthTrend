/**
 * SectionHeading.tsx
 * A reusable eyebrow + h2 heading block used across the landing page.
 */
import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}

export const SectionHeading = ({ eyebrow, title, align = "center" }: Props) => (
  <div className={align === "center" ? "text-center" : ""}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-xs font-bold tracking-widest text-primary uppercase"
    >
      {eyebrow}
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight"
    >
      {title}
    </motion.h2>
  </div>
);


/**
 * TestimonialsSection.tsx
 * Three student quotes in cards.
 */

const TESTIMONIALS = [
  {
    quote: "YouthTrend is where I found out about everything happening on campus before anyone else.",
    user: "Amara K.",
    sub:  "Computer Science · UB",
    avatar: "https://i.pravatar.cc/100?u=test0",
  },
  {
    quote: "Finally, a space where my opinions don't get drowned in random Facebook groups.",
    user: "Blaise E.",
    sub:  "Business · IUBS",
    avatar: "https://i.pravatar.cc/100?u=test1",
  },
  {
    quote: "I published my first article here and got 1,200 claps in two days. Wahala!",
    user: "Chanceline F.",
    sub:  "Law · UY1",
    avatar: "https://i.pravatar.cc/100?u=test2",
  },
];

export const TestimonialsSection = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="container py-16"
  >
    <SectionHeading eyebrow="Voices" title="Loved by students across Cameroon" />
    <div className="mt-10 grid md:grid-cols-3 gap-5">
      {TESTIMONIALS.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="yt-card p-6"
        >
          {/* Quote marks decoration */}
          <div className="text-4xl font-serif text-primary/20 leading-none mb-2">"</div>
          <p className="text-sm leading-relaxed">{t.quote}"</p>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={t.avatar}
              className="h-9 w-9 rounded-full ring-2 ring-primary/20"
              alt={t.user}
            />
            <div>
              <div className="text-sm font-semibold">{t.user}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.section>
);