import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`inline-flex items-center gap-2 font-extrabold text-lg tracking-tight ${className}`}>
    <span className="h-8 w-8 rounded-lg bg-primary inline-flex items-center justify-center text-primary-foreground">
      <Leaf className="h-4 w-4" />
    </span>
    <span>YouthTrend</span>
  </Link>
);
