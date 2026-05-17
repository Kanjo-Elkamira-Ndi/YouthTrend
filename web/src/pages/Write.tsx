import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types/post";

const Write = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<"public" | "campus_only">("campus_only");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(postId ?? null);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [publishOpen, setPublishOpen] = useState(false);

  const { data: editPost, isLoading: editLoading } = useQuery({
    queryKey: ['post-edit', postId],
    queryFn: () => api.get('/posts/id/' + postId!).then(unwrap<Post>),
    enabled: !!postId,
  });

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setSubtitle(editPost.subtitle ?? "");
      setBody(editPost.body);
      setCategory(editPost.category);
      setTags(editPost.tags);
      setVisibility(editPost.visibility);
      setIsAnonymous(editPost.is_anonymous);
      setCurrentPostId(editPost.id);
    }
  }, [editPost]);

  const createMutation = useMutation({
    mutationFn: (draftData: Record<string, unknown>) =>
      api.post('/posts', draftData).then(unwrap<{ id: string }>),
    onSuccess: (data) => {
      setCurrentPostId(data.id);
      setAutoSaveState("saved");
    },
    onError: () => setAutoSaveState("failed"),
  });

  const updateMutation = useMutation({
    mutationFn: (draftData: Record<string, unknown>) =>
      api.patch('/posts/' + currentPostId, draftData).then(unwrap),
    onSuccess: () => setAutoSaveState("saved"),
    onError: () => setAutoSaveState("failed"),
  });

  const publishMutation = useMutation({
    mutationFn: () => api.post('/posts/' + currentPostId + '/publish').then(unwrap),
    onSuccess: () => {
      toast.success("Your post is live!");
      navigate('/my-posts');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to publish.';
      toast.error(msg);
    },
  });

  const getDraftData = useCallback(() => ({
    title,
    subtitle: subtitle || undefined,
    body,
    category,
    tags: tags.length ? tags : undefined,
    visibility,
    isAnonymous,
  }), [title, subtitle, body, category, tags, visibility, isAnonymous]);

  const autoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveState("saving");
      const draftData = getDraftData();

      if (!draftData.title || !draftData.body) {
        setAutoSaveState("idle");
        return;
      }

      try {
        if (currentPostId) {
          await updateMutation.mutateAsync(draftData);
        } else {
          await createMutation.mutateAsync(draftData);
        }
      } catch {
        setAutoSaveState("failed");
      }
    }, 1500);
  }, [getDraftData, currentPostId, updateMutation, createMutation]);

  useEffect(() => {
    autoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, subtitle, body, category, tags, visibility, isAnonymous]);

  const handleSaveDraft = async () => {
    const draftData = getDraftData();
    setAutoSaveState("saving");
    try {
      if (currentPostId) {
        await updateMutation.mutateAsync(draftData);
      } else {
        await createMutation.mutateAsync(draftData);
      }
      toast.success("Draft saved.");
    } catch {
      toast.error("Failed to save draft.");
      setAutoSaveState("failed");
    }
  };

  const handlePublish = async () => {
    if (!currentPostId) {
      const draftData = getDraftData();
      try {
        const created = await createMutation.mutateAsync(draftData);
        setCurrentPostId(created.id);
        await publishMutation.mutateAsync();
      } catch {
        toast.error("Failed to publish.");
      }
    } else {
      publishMutation.mutate();
    }
  };

  if (postId && editLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="container py-8 text-center text-muted-foreground">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {autoSaveState === "saving" ? "Saving..." : autoSaveState === "saved" ? "Saved" : autoSaveState === "failed" ? "Save failed" : ""}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSaveDraft}>Save Draft</Button>
            <Button
              size="sm"
              onClick={handlePublish}
              className="relative overflow-hidden bg-primary hover:bg-primary/90 group"
            >
              <span className="relative z-10">Publish →</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container grid lg:grid-cols-[1fr_320px] gap-8 py-8">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <input
            className="w-full bg-transparent text-4xl md:text-5xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/50"
            placeholder="Your headline here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full bg-transparent text-xl text-muted-foreground outline-none placeholder:text-muted-foreground/50"
            placeholder="Add a subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/60 transition-colors cursor-pointer">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop a cover image, or click to upload</p>
          </div>

          <Textarea
            rows={20}
            placeholder="Tell your story..."
            className="text-lg leading-relaxed border-0 bg-transparent focus-visible:ring-0 resize-none px-0 shadow-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-32 self-start">
          <div className="yt-card p-4 space-y-4">
            <h3 className="font-bold">Post Settings</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
            <ToggleRow label="Public visibility" desc="Show outside your campus" checked={visibility === 'public'} onChange={(v) => setVisibility(v ? 'public' : 'campus_only')} />
            <ToggleRow label="Anonymous" desc="Hide your name" checked={isAnonymous} onChange={setIsAnonymous} />
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Write;
