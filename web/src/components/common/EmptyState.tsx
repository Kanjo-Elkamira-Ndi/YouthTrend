import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = { label: string; href?: string; onClick?: () => void; icon?: LucideIcon };
type Props = {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  action?: Action;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { circle: "h-14 w-14", icon: "h-7 w-7", heading: "text-lg" },
  md: { circle: "h-20 w-20", icon: "h-10 w-10", heading: "text-xl" },
  lg: { circle: "h-28 w-28", icon: "h-14 w-14", heading: "text-2xl" },
};

export const EmptyState = ({ icon: Icon, heading, subtext, action, size = "md", className }: Props) => {
  const s = SIZES[size];
  const ActionIcon = action?.icon;
  const btn = action ? (
    <Button className="mt-4" onClick={action.onClick}>
      {ActionIcon && <ActionIcon className="h-4 w-4" />}
      {action.label}
    </Button>
  ) : null;

  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12", className)}>
      <motion.div
        whileHover={action ? { scale: 1.05 } : undefined}
        className={cn("rounded-full bg-muted inline-flex items-center justify-center mb-4", s.circle)}
      >
        <Icon className={cn("text-muted-foreground", s.icon)} />
      </motion.div>
      <h3 className={cn("font-bold", s.heading)}>{heading}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{subtext}</p>
      {action && (action.href ? <Link to={action.href}>{btn}</Link> : btn)}
    </div>
  );
};

export default EmptyState;
