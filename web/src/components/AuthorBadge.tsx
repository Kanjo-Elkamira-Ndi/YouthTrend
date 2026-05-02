import type { Author } from "@/lib/mock";

export function AuthorBadge({ author, time, size = "md" }: { author: Author; time?: string; size?: "sm" | "md" }) {
  const av = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="flex items-center gap-2.5">
      <img src={author.avatar} alt={author.name} className={`${av} rounded-full object-cover`} />
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <span className="truncate">{author.name}</span>
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            {author.campus}
          </span>
        </div>
        {time && <div className="text-xs text-muted-foreground">{time}</div>}
      </div>
    </div>
  );
}
