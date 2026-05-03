import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bold, Italic, Underline, Quote, List, Image as ImageIcon, Link2, Heading1, Heading2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { useState } from "react";

const Write = () => {
  const [tags, setTags] = useState<string[]>(["campus", "uy1"]);
  const [tagInput, setTagInput] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Save Draft</Button>
            <Button variant="outline" size="sm">Preview</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">Publish →</Button>
          </div>
        </div>
      </div>

      <div className="container grid lg:grid-cols-[1fr_320px] gap-8 py-8">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <input className="w-full bg-transparent text-4xl md:text-5xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/50" placeholder="Your headline here..." />
          <input className="w-full bg-transparent text-xl text-muted-foreground outline-none placeholder:text-muted-foreground/50" placeholder="Add a subtitle (optional)" />

          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/60 transition-colors cursor-pointer">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop a cover image, or click to upload</p>
          </div>

          <div className="flex flex-wrap items-center gap-1 border border-border rounded-lg p-1.5 bg-card sticky top-16 z-30">
            {[Bold, Italic, Underline, Heading1, Heading2, Quote, List, ImageIcon, Link2].map((I, i) => (
              <button key={i} className="h-8 w-8 rounded inline-flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground"><I className="h-4 w-4" /></button>
            ))}
          </div>

          <Textarea rows={20} placeholder="Tell your story..." className="text-lg leading-relaxed border-0 bg-transparent focus-visible:ring-0 resize-none px-0 shadow-none" />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-32 self-start">
          <div className="yt-card p-4 space-y-4">
            <h3 className="font-bold">Post Settings</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <span className="inline-flex items-center gap-2">
                        <c.icon className="h-4 w-4" />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-[42px]">
                {tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    #{t} <button onClick={() => setTags(tags.filter((x) => x !== t))} className="ml-1">×</button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); setTags([...tags, tagInput.trim()]); setTagInput(""); }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <ToggleRow label="Public visibility" desc="Show outside your campus" />
            <ToggleRow label="Anonymous" desc="Hide your name" />
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, desc }: { label: string; desc: string }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
    <Switch />
  </div>
);

export default Write;
