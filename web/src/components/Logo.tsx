import { Leaf } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-foreground">
        <Leaf className="h-4 w-4" />
      </span>
      <span className="text-lg">
        Youth<span className="text-brand">Trend</span>
      </span>
    </span>
  );
}
