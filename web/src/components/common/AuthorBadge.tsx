import { User } from "@/types";
import { Link } from "react-router-dom";

type Props = { user: User; size?: "sm" | "md"; showCampus?: boolean; sub?: string };

export const AuthorBadge = ({ user, size = "md", showCampus = true, sub }: Props) => {
  const av = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <img src={user.avatar} alt={user.name} className={`${av} rounded-full object-cover ring-1 ring-border`} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link to={`/profile/${user.username}`} className="text-sm font-semibold truncate hover:underline">
            {user.name}
          </Link>
          {showCampus && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              🏫 {user.campus}
            </span>
          )}
        </div>
        {sub && <div className="text-xs text-muted-foreground truncate">{sub}</div>}
      </div>
    </div>
  );
};
