import { Logo } from "@/components/common/Logo";
import { Twitter, Instagram } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div className="md:col-span-2">
        <Logo />
        <p className="mt-3 text-sm text-muted-foreground max-w-xs">Where Campus Gist Lives 🇨🇲</p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Platform</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">About</a></li>
          <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-foreground">Terms</a></li>
          <li><a href="#" className="hover:text-foreground">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Follow</h4>
        <div className="flex gap-3">
          <a href="#" className="h-9 w-9 rounded-lg border border-border inline-flex items-center justify-center hover:bg-secondary"><Twitter className="h-4 w-4" /></a>
          <a href="#" className="h-9 w-9 rounded-lg border border-border inline-flex items-center justify-center hover:bg-secondary"><Instagram className="h-4 w-4" /></a>
          <a href="#" className="h-9 w-9 rounded-lg border border-border inline-flex items-center justify-center hover:bg-secondary text-sm">💬</a>
        </div>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-4 text-xs text-muted-foreground">© 2026 YouthTrend. All rights reserved.</div>
    </div>
  </footer>
);
