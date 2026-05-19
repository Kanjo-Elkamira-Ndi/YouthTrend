import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Heart, Megaphone, MessageCircle, Settings as SettingsIcon,
  UserPlus, Bookmark, Flame, Newspaper, Trophy, GraduationCap, Calendar,
  Music, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import type { PaginationMeta } from "@/lib/api";
import { InlineError } from "@/components/common/InlineError";

interface NotificationFull {
  id: string;
  user_id: string;
  type: string;
  actor_id: string | null;
  target_type: string | null;
  target_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  meta: Record<string, unknown> | null;
  actor_name: string | null;
  actor_username: string | null;
  actor_avatar_url: string | null;
}

const ICON_MAP: Record<string, { icon: any; color: string }> = {
  clap: { icon: Heart, color: "bg-red-500/10 text-red-400" },
  comment: { icon: MessageCircle, color: "bg-primary/10 text-primary" },
  comment_reply: { icon: MessageCircle, color: "bg-primary/10 text-primary" },
  follow: { icon: UserPlus, color: "bg-emerald-500/10 text-emerald-400" },
  campus_announcement: { icon: Megaphone, color: "bg-amber-500/10 text-amber-400" },
  post_pinned: { icon: Bookmark, color: "bg-purple-500/10 text-purple-400" },
  post_taken_down: { icon: Flame, color: "bg-orange-500/10 text-orange-400" },
  writer_upgrade_approved: { icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-400" },
  writer_upgrade_declined: { icon: Flame, color: "bg-red-500/10 text-red-400" },
  system: { icon: Bell, color: "bg-secondary text-muted-foreground" },
  post_approved: { icon: CheckCheck, color: "bg-emerald-500/10 text-emerald-400" },
};

function getNotificationHref(n: NotificationFull): string {
  const meta = n.meta as Record<string, string> | null;
  switch (n.type) {
    case 'clap':
    case 'comment':
    case 'comment_reply':
    case 'post_pinned':
    case 'post_approved':
      if (meta?.campusSlug && meta?.postSlug) return `/post/${meta.campusSlug}/${meta.postSlug}`;
      if (meta?.postSlug) return `/post/${meta.postSlug}`;
      return n.target_id ? `/post/${n.target_id}` : '/feed';
    case 'follow':
      return n.actor_username ? `/profile/${n.actor_username}` : '/feed';
    case 'post_taken_down':
      return '/my-posts';
    case 'writer_upgrade_approved':
    case 'writer_upgrade_declined':
      return '/write';
    case 'campus_announcement':
    case 'system':
      return '/feed';
    default:
      return '/feed';
  }
}

function groupNotifications(items: NotificationFull[]): Map<string, NotificationFull[]> {
  const groups = new Map<string, NotificationFull[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - today.getDay());

  for (const n of items) {
    const d = new Date(n.created_at);
    let label: string;
    if (d >= today) label = 'Today';
    else if (d >= yesterday) label = 'Yesterday';
    else if (d >= thisWeek) label = 'This Week';
    else label = 'Earlier';
    const existing = groups.get(label) ?? [];
    existing.push(n);
    groups.set(label, existing);
  }
  return groups;
}

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page };
  if (tab === 'unread') params.read = 'false';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', tab, page],
    queryFn: () => api.get('/notifications', { params }).then(unwrapPaginated<NotificationFull>),
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then(unwrap<{ unreadCount: number }>),
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch('/notifications/' + id + '/read'),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const typed = old as { data?: NotificationFull[] };
        if (!typed.data) return old;
        return { ...typed, data: typed.data.map(n => n.id === id ? { ...n, read: true } : n) };
      });
      queryClient.setQueryData(['notifications', 'unread-count'], (old: { unreadCount: number } | undefined) => {
        if (!old) return old;
        return { unreadCount: Math.max(0, old.unreadCount - 1) };
      });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/read-all').then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => api.delete('/notifications/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const items = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;
  const unreadCount = unreadData?.unreadCount ?? 0;
  const grouped = useMemo(() => groupNotifications(items), [items]);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  const handleNotifClick = (n: NotificationFull) => {
    if (!n.read) markRead.mutate(n.id);
    navigate(getNotificationHref(n));
  };

  return (
    <AppShell hideRight>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
                <CheckCheck className="h-4 w-4 mr-1" /> Mark All as Read
              </Button>
            )}
            <Link to="/settings#notifications">
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }} className="mb-6">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabTrigger value="all" label="All" />
            <TabTrigger value="unread" label="Unread" badge={unreadCount} />
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : isError ? (
          <InlineError message="Failed to load notifications." onRetry={refetch} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">All caught up</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === 'unread' ? 'No unread notifications.' : 'Check back after you publish your first post.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((g) => {
              const groupItems = grouped.get(g);
              if (!groupItems?.length) return null;
              return (
                <section key={g}>
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 sticky top-16 bg-background/95 backdrop-blur py-1">
                    {g}
                  </h2>
                  <div className="space-y-1">
                    {groupItems.map((n) => (
                      <NotifRow
                        key={n.id}
                        n={n}
                        onClick={() => handleNotifClick(n)}
                        onDelete={() => deleteNotif.mutate(n.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            {meta?.hasNext && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Load more</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const TabTrigger = ({ value, label, badge }: { value: string; label: string; badge?: number }) => (
  <TabsTrigger
    value={value}
    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none px-4 pb-3 gap-2"
  >
    {label}
    {badge !== undefined && badge > 0 && (
      <Badge className="bg-primary text-primary-foreground h-5 px-1.5 text-[10px]">{badge}</Badge>
    )}
  </TabsTrigger>
);

const NotifRow = ({ n, onClick, onDelete }: { n: NotificationFull; onClick: () => void; onDelete: () => void }) => {
  const meta = ICON_MAP[n.type] ?? { icon: MessageCircle, color: "bg-secondary text-muted-foreground" };
  const Icon = meta.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer group",
        !n.read && "border-l-2 border-primary bg-primary/[0.03] pl-3"
      )}
    >
      <span className={cn("h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0", meta.color)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{n.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
          {n.actor_name && <span className="text-xs text-muted-foreground">· {n.actor_name}</span>}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="h-6 w-6 rounded inline-flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {!n.read && <span className="h-2 w-2 rounded-full bg-primary self-center shrink-0" />}
    </div>
  );
};

export default Notifications;
