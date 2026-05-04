import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Chrome, Facebook, Apple, X } from "lucide-react";

export const SocialButton = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Button variant="outline" className="w-full h-11 justify-start gap-3 font-medium">
    <span className="h-5 w-5 inline-flex items-center justify-center">{icon}</span>
    {label}
  </Button>
);

export const SocialRow = () => (
  <div className="grid grid-cols-2 gap-2.5">
    <SocialButton icon={<Chrome className="h-5 w-5" />} label="Google" />
    <SocialButton icon={<Facebook className="h-5 w-5 text-[#1877F2]" />} label="Facebook" />
    <SocialButton icon={<Apple className="h-5 w-5" />} label="Apple" />
    <SocialButton icon={<X className="h-5 w-5" />} label="X" />
  </div>
);

export const Divider = () => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
  </div>
);