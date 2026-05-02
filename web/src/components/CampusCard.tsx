import { Link } from "@tanstack/react-router";
import type { Campus } from "@/lib/mock";
import { ArrowRight } from "lucide-react";

export function CampusCard({ campus, latest }: { campus: Campus; latest: string }) {
  return (
    <div className="card-hover rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-2xl">{campus.logo}</div>
        <div>
          <h3 className="font-bold text-foreground">{campus.name}</h3>
          <p className="text-xs text-muted-foreground">{campus.members.toLocaleString()} members</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">Latest: <span className="text-foreground">{latest}</span></p>
      <Link to="/feed" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:gap-2 transition-all">
        Explore Campus <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
