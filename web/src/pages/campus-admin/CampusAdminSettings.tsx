import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Upload, X, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ACCENT_PRESETS = [
  { id: "green", label: "Primary Green", hex: "#1A6E3C" },
  { id: "blue", label: "Deep Blue", hex: "#1E3A5F" },
  { id: "maroon", label: "Maroon", hex: "#6B1E1E" },
];

const Upload2 = ({ label }: { label: string }) => (
  <div className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
    <div className="text-sm font-semibold mt-2">{label}</div>
    <div className="text-xs text-muted-foreground">PNG or SVG, max 2MB</div>
  </div>
);

const CampusAdminSettings = () => {
  const [domains, setDomains] = useState(["@uy1.cm", "@uniyaounde1.cm"]);
  const [domainInput, setDomainInput] = useState("");
  const [accent, setAccent] = useState("green");

  const addDomain = () => {
    const d = domainInput.trim();
    if (d && !domains.includes(d)) setDomains([...domains, d]);
    setDomainInput("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[900px] mx-auto w-full">
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-5">
          <div className="yt-card p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Campus Name</label>
              <Input defaultValue="University of Yaoundé I" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Campus Short Code</label>
              <div className="relative">
                <Input defaultValue="UY1" disabled className="pr-10" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent>Short code is permanent and cannot be changed</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Campus Description</label>
              <Textarea rows={3} defaultValue="The flagship public university of Cameroon, located in Yaoundé." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Upload2 label="Campus Logo" />
              <Upload2 label="Cover Banner" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* REGISTRATION */}
        <TabsContent value="registration" className="space-y-5">
          <div className="yt-card p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Allowed Email Domains</label>
              <div className="flex flex-wrap gap-2 p-2 rounded-md border border-input bg-background min-h-[44px]">
                {domains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-semibold">
                    {d}
                    <button onClick={() => setDomains(domains.filter((x) => x !== d))} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent text-sm outline-none px-1"
                  placeholder="@example.cm"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Registration Mode</label>
              <RadioGroup defaultValue="open" className="space-y-2">
                {[
                  { v: "open", l: "Open", d: "Anyone with an allowed domain can join" },
                  { v: "invite", l: "Invite Only", d: "Campus Admin must invite new members" },
                  { v: "closed", l: "Closed", d: "No new registrations are accepted" },
                ].map((o) => (
                  <Label key={o.v} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary/50">
                    <RadioGroupItem value={o.v} className="mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm">{o.l}</div>
                      <div className="text-xs text-muted-foreground">{o.d}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold text-sm">Auto-approve Writers</div>
                <div className="text-xs text-muted-foreground">New registrations are automatically granted Writer access</div>
              </div>
              <Switch />
            </div>

            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* MODERATION */}
        <TabsContent value="moderation" className="space-y-5">
          <div className="yt-card p-6 space-y-4">
            {[
              { t: "Post approval required", d: "All posts must be approved before going live" },
              { t: "Anonymous posting", d: "Allow students to post anonymously" },
              { t: "Profanity filter", d: "Auto-flag posts containing profanity" },
            ].map((s) => (
              <div key={s.t} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-semibold text-sm">{s.t}</div>
                  <div className="text-xs text-muted-foreground">{s.d}</div>
                </div>
                <Switch />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Moderation SLA</label>
              <Select defaultValue="24">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Target review time: 12 hours</SelectItem>
                  <SelectItem value="24">Target review time: 24 hours</SelectItem>
                  <SelectItem value="48">Target review time: 48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="space-y-5">
          <div className="yt-card p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Campus Accent Color</label>
              <div className="flex items-center gap-3">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAccent(p.id)}
                    title={p.label}
                    className="relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all"
                    style={{ background: p.hex, boxShadow: accent === p.id ? `0 0 0 2px ${p.hex}` : undefined }}
                  >
                    {accent === p.id && <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Default Language</label>
              <RadioGroup defaultValue="both" className="flex flex-wrap gap-2">
                {[{v:"en",l:"English"},{v:"fr",l:"French"},{v:"both",l:"Both"}].map((o) => (
                  <Label key={o.v} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 cursor-pointer hover:bg-secondary/50">
                    <RadioGroupItem value={o.v} />
                    <span className="text-sm font-medium">{o.l}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <Button>Save Changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CampusAdminSettings;
