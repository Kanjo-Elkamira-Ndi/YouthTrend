import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Award, FileText, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, unwrap } from "@/lib/api";
import type { WriterUpgradeFull } from "@/types/writer";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import { toast } from "sonner";

const TOPICS = ["Academics", "Gist", "Sports", "News", "Events", "Culture", "Opinion", "Tech"];

const WriterUpgradeRequest = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [sampleTitle, setSampleTitle] = useState("");
  const [sampleBody, setSampleBody] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const { data: existing, isLoading, isError, refetch } = useQuery({
    queryKey: ['writer-upgrade', 'mine'],
    queryFn: () => api.get('/writer-upgrade/mine').then(unwrap<WriterUpgradeFull[]>),
  });

  const submit = useMutation({
    mutationFn: () =>
      api.post('/writer-upgrade', {
        topics,
        motivation,
        sampleTitle,
        sampleBody,
        externalLink: externalLink.trim() || undefined,
      }).then(unwrap),
    onSuccess: () => {
      navigate('/check-inbox?mode=upgrade');
    },
    onError: () => toast.error('Failed to submit application.'),
  });

  const existingRequest = existing && existing.length > 0 ? existing[0] : null;

  const toggle = (t: string) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (isLoading) {
    return (
      <AppShell hideRight>
        <div className="max-w-3xl mx-auto"><FeedSkeleton /></div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell hideRight>
        <div className="max-w-3xl mx-auto mt-12">
          <InlineError message="Couldn't load your application status." onRetry={refetch} />
        </div>
      </AppShell>
    );
  }

  if (existingRequest?.status === 'approved') {
    return (
      <AppShell hideRight>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-16">
          <div className="h-20 w-20 rounded-full bg-primary/15 inline-flex items-center justify-center mb-4">
            <Award className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold">You're a Verified Writer!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your application has been approved. You now have access to featured placement, analytics, and the verified badge.
          </p>
          <Button className="mt-6" asChild>
            <a href="/write">Start writing →</a>
          </Button>
        </motion.div>
      </AppShell>
    );
  }

  if (existingRequest?.status === 'declined') {
    return (
      <AppShell hideRight>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-16">
          <div className="h-20 w-20 rounded-full bg-red-500/10 inline-flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold">Application declined</h1>
          {existingRequest.reviewer_note && (
            <p className="text-sm text-muted-foreground mt-2 italic">"{existingRequest.reviewer_note}"</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            You can submit a new application after 30 days.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Submit new application
          </Button>
        </motion.div>
      </AppShell>
    );
  }

  if (existingRequest?.status === 'pending') {
    return (
      <AppShell hideRight>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-16">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 inline-flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold">Application under review</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your application is being reviewed by the campus editorial team. You'll be notified when a decision is made.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Submitted on {new Date(existingRequest.created_at).toLocaleDateString()}
          </p>
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
            <Label htmlFor="motivation">Why do you want to become a writer? (min 50 chars)</Label>
            <Textarea
              id="motivation" value={motivation} maxLength={1000}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Tell us why your voice matters on YouthTrend."
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">{motivation.length}/1000</p>
          </div>

          <div>
            <Label htmlFor="sampleTitle">Sample article title</Label>
            <Input
              id="sampleTitle" value={sampleTitle} maxLength={500}
              onChange={(e) => setSampleTitle(e.target.value)}
              placeholder="Give your sample a compelling title"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="sampleBody">Sample article body</Label>
            <Textarea
              id="sampleBody" value={sampleBody}
              onChange={(e) => setSampleBody(e.target.value)}
              placeholder="Write or paste a sample article (min 100 characters)."
              className="mt-2 min-h-[200px]"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground mt-1">{sampleBody.length}/10000</p>
          </div>

          <div>
            <Label htmlFor="externalLink">External link (optional)</Label>
            <Input
              id="externalLink" value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="Link to your portfolio or previous work"
              className="mt-2"
            />
          </div>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
            <span>I confirm all information is accurate.</span>
          </label>

          <div className="flex justify-end">
            <Button
              disabled={!agree || topics.length === 0 || motivation.length < 50 || sampleTitle.length < 5 || sampleBody.length < 100 || submit.isPending}
              onClick={() => submit.mutate()}
            >
              <FileText className="h-4 w-4" /> {submit.isPending ? 'Submitting...' : 'Submit application'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default WriterUpgradeRequest;
