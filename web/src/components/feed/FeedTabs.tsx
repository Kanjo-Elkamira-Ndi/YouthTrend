import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FeedTab = { value: string; label: string };

type Props = {
  tabs: FeedTab[];
  active: string;
  onChange: (v: string) => void;
};

export const FeedTabs = ({ tabs, active, onChange }: Props) => (
  <div className="w-full border-b border-border flex items-center gap-1 overflow-x-auto">
    {tabs.map((t) => {
      const isActive = t.value === active;
      return (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "relative px-4 pb-3 pt-2 text-sm font-medium transition-colors shrink-0",
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {isActive && (
            <motion.span
              layoutId="feedTabsIndicator"
              className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

export default FeedTabs;
