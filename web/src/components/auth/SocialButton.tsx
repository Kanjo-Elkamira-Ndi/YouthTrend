import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";
import { Chrome, Facebook, Apple, X } from "lucide-react";

type Provider = "google" | "facebook" | "apple" | "twitter";

export const SocialButton = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) => (
  <Button variant="outline" className="w-full h-11 justify-start gap-3 font-medium" onClick={onClick}>
    <span className="h-5 w-5 inline-flex items-center justify-center">{icon}</span>
    {label}
  </Button>
);

type SocialHandlers = Partial<Record<Provider, () => void>>;

export const SocialRow = ({ handlers }: { handlers?: SocialHandlers }) => (
  <div className="grid grid-cols-2 gap-2.5">
    <SocialButton icon={<Chrome className="h-5 w-5" />} label="Google" onClick={handlers?.google} />
    <SocialButton icon={<Facebook className="h-5 w-5 text-[#1877F2]" />} label="Facebook" onClick={handlers?.facebook} />
    <SocialButton icon={<Apple className="h-5 w-5" />} label="Apple" onClick={handlers?.apple} />
    <SocialButton icon={<X className="h-5 w-5" />} label="X" onClick={handlers?.twitter} />
  </div>
);

export const Divider = () => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
  </div>
);
