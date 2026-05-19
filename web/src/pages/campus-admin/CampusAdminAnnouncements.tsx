import { useState } from "react";
import { motion } from "framer-motion";
import { Pin, Eye, Pencil, EyeOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import { InlineError } from "@/components/common/InlineError";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  body: string;
  visibility: 'all_students' | 'writers_only' | 'moderators_only';
  is_pinned: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
}

const VISIBILITY_LABELS: Record<string, string> = {
  all_students: 'All Students',
  writers_only: 'Writers Only',
  moderators_only: 'Moderators Only',
};

const CampusAdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<string>('all_students');
  const [isPinned, setIsPinned] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: () => api.get('/announcements').then(unwrapPaginated<Announcement>),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; body: string; visibility: string; isPinned: boolean }) =>
      api.post('/announcements', data).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement published.');
      resetForm();
    },
    onError: () => toast.error('Failed to publish announcement.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; body?: string; visibility?: string; isPinned?: boolean }) =>
      api.patch('/announcements/' + id, data).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated.');
      resetForm();
    },
    onError: () => toast.error('Failed to update announcement.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('/announcements/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted.');
    },
    onError: () => toast.error('Failed to delete announcement.'),
  });

  const resetForm = () => {
    setTitle("");
    setBody("");
    setVisibility('all_students');
    setIsPinned(false);
    setEditing(null);
  };

  const startEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title);
    setBody(a.body);
    setVisibility(a.visibility);
    setIsPinned(a.is_pinned);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, title, body, visibility, isPinned });
    } else {
      createMutation.mutate({ title, body, visibility, isPinned });
    }
  };

  const togglePin = (a: Announcement) => {
    updateMutation.mutate({ id: a.id, isPinned: !a.is_pinned });
  };

  const announcements = data?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6">
        {/* Composer */}
        <div className="yt-card p-6 space-y-4">
          <h2 className="text-lg font-extrabold">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title</label>
            <Input placeholder="A short, clear title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Body</label>
            <Textarea rows={5} placeholder="Write the announcement here..." className="resize-y" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Visibility</label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_students">All Students</SelectItem>
                <SelectItem value="writers_only">Writers Only</SelectItem>
                <SelectItem value="moderators_only">Moderators Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="text-sm">
              <div className="font-semibold">Pin to feed</div>
              <div className="text-xs text-muted-foreground">Stick this to the top of the campus feed</div>
            </div>
            <Switch checked={isPinned} onCheckedChange={setIsPinned} />
          </div>

          <div className="space-y-2 pt-2 flex gap-2">
            <Button className="flex-1" onClick={submit} disabled={!title || !body || createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editing ? 'Update Announcement' : 'Publish Announcement'}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold mb-1">
            {isLoading ? 'Loading...' : `Published Announcements (${announcements.length})`}
          </h2>

          {isLoading ? (
            <FeedSkeleton />
          ) : isError ? (
            <InlineError message="Couldn't load announcements." onRetry={refetch} />
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="yt-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Official</span>
                  {a.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {a.published_at ? new Date(a.published_at).toLocaleDateString() : new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-semibold text-sm">{a.title}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{VISIBILITY_LABELS[a.visibility] ?? a.visibility}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{a.view_count?.toLocaleString() ?? '0'}</span>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-border">
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-secondary" title={a.is_pinned ? 'Unpin' : 'Pin'} onClick={() => togglePin(a)}>
                    <Pin className={`h-3.5 w-3.5 ${a.is_pinned ? 'fill-primary text-primary' : ''}`} />
                  </button>
                  <button className="h-8 px-2 text-xs inline-flex items-center gap-1 rounded hover:bg-secondary" onClick={() => startEdit(a)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    className="h-8 px-2 text-xs inline-flex items-center gap-1 rounded hover:bg-red-500/10 text-red-500"
                    onClick={() => deleteMutation.mutate(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CampusAdminAnnouncements;
