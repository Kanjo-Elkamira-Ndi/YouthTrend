import { useState } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
      {(["EN", "FR"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-md px-2 py-1 transition-colors ${
            lang === l ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "EN" ? "🇬🇧 EN" : "🇫🇷 FR"}
        </button>
      ))}
    </div>
  );
}
