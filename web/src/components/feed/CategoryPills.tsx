import { CATEGORIES } from "@/lib/constants";

type Props = {
  active: string;
  onChange: (v: string) => void;
  options?: string[];
};

export const CategoryPills = ({ active, onChange, options }: Props) => {
  const items = ["All", ...(options ?? CATEGORIES.map((c) => c.name))];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const cat = CATEGORIES.find((c) => c.name === it);
        const isActive = active === it;
        return (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
              ${isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/60 hover:text-primary"}`}
          >
            {cat ? (
              <span className="inline-flex items-center gap-2">
                <cat.icon className="h-4 w-4" />
                {it}
              </span>
            ) : it}
          </button>
        );
      })}
    </div>
  );
};
