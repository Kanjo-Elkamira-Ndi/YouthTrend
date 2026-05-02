import { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  side?: "left" | "right";
  decorative: ReactNode;
};

export const SplitScreen = ({ children, decorative }: Props) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    {/* Decorative */}
    <div className="relative hidden lg:flex flex-col justify-between p-10 yt-gradient-cta text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative"><Logo className="text-primary-foreground" /></div>
      <div className="relative">{decorative}</div>
    </div>
    {/* Form */}
    <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="lg:hidden mb-8"><Logo /></div>
        {children}
      </motion.div>
    </div>
  </div>
);
