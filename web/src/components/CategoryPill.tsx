import { categories } from "@/lib/mock";

export function CategoryPill({
  active,
  onClick,
  category,
}: {
  active?: boolean;
  onClick?: () => void;
  category: (typeof categories)[number];
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-brand bg-brand text-brand-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:text-foreground"
      }`}
    >
      <span>{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
}

export function CategoryRow({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {categories.map((c) => (
        <CategoryPill key={c.id} category={c} active={active === c.id} onClick={() => onChange(c.id)} />
      ))}
    </div>
  );
}
