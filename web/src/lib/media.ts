export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function initials(name?: string | null, fallback = "U"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
