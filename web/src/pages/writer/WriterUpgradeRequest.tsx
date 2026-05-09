import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Award, CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const REQUIREMENTS = [
  { label: "Active for at least 30 days", met: true },
  { label: "Published 3+ posts", met: true },
  { label: "Completed campus profile", met: true },
  { label: "Verified student email", met: false },
];

const TOPICS = ["Academics", "Gist", "Sports", "News", "Events", "Culture", "Opinion", "Tech"];

const WriterUpgradeRequest = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [sample, setSample] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (t: string) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = () => {
    setSubmitted(true);
    toast.success("Application submitted", { description: "We'll review within 3 business days." });
  };

  if (submitted) {
    return (
      <AppShell hideRight>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto text-center py-16"
        >
          <div className="h-20 w-20 rounded-full bg-primary/15 inline-flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold">Application received</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Our editorial team will review your request and respond within 3 business days. You'll get a notification.
          </p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>Back to form</Button>
        </motion.div>
      </AppShell>
    );
  }

  return (
    <AppShell hideRight>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/15 inline-flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Become a Verified Writer</h1>
            <p className="text-sm text-muted-foreground">Get featured placement, analytics, and the verified badge.</p>
          </div>
        </div>

        <div className="yt-card p-5 mb-5">
          <h2 className="font-semibold mb-3 inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Eligibility</h2>
          <ul className="space-y-2">
            {REQUIREMENTS.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${r.met ? "text-primary" : "text-muted-foreground/40"}`} />
                <span className={r.met ? "" : "text-muted-foreground"}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="yt-card p-5 space-y-5">
          <div>
            <Label>Topics you'll cover</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    topics.includes(t)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Writer bio (max 200 chars)</Label>
            <Textarea
              id="bio" value={bio} maxLength={200}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us why your voice matters on YouthTrend."
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/200</p>
          </div>

          <div>
            <Label htmlFor="sample">Sample writing or links</Label>
            <Textarea
              id="sample" value={sample}
              onChange={(e) => setSample(e.target.value)}
              placeholder="Paste a sample article, or share links to your previous work."
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div>
            <Label>ID verification</Label>
            <button className="mt-2 w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 hover:bg-muted/30 transition">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm">Upload your student ID card</span>
              <span className="text-xs text-muted-foreground">PNG or JPG, max 5MB</span>
            </button>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
            <span>I agree to the <a href="#" className="text-primary underline">Writer Code of Conduct</a> and confirm all information is accurate.</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline">Save draft</Button>
            <Button disabled={!agree || topics.length === 0} onClick={submit}>
              <FileText className="h-4 w-4" /> Submit application
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default WriterUpgradeRequest;
