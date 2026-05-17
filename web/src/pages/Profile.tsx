import { AppShell } from "@/components/layout/AppShell";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/PostCard";
import { Calendar, MapPin } from "lucide-react";
import { InlineError } from "@/components/common/InlineError";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { PublicProfile } from "@/types/user";
import type { Post } from "@/types/post";
import { FeedSkeleton } from "@/components/common/Skeletons";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading, isError: profileError, refetch } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get('/users/' + username).then(unwrap<PublicProfile>),
    enabled: !!username,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['profile-posts', profile?.id],
    queryFn: () => api.get('/posts/user/' + profile!.id).then(unwrapPaginated<Post>),
    enabled: !!profile?.id,
  });

  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', username],
    queryFn: () => api.get('/users/' + username + '/followers').then(unwrapPaginated<PublicProfile>),
    enabled: !!username,
  });

  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', username],
    queryFn: () => api.get('/users/' + username + '/following').then(unwrapPaginated<PublicProfile>),
    enabled: !!username,
  });

  const isOwner = currentUser?.username === username;

  const isCurrentlyFollowing = profile?.is_following ?? false;

  const followMutation = useMutation({
    mutationFn: () => isCurrentlyFollowing
      ? api.delete('/users/' + profile!.id + '/follow')
      : api.post('/users/' + profile!.id + '/follow'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });
      const prev = queryClient.getQueryData(['profile', username]);
      queryClient.setQueryData(['profile', username], (old: PublicProfile | undefined) => {
        if (!old) return old;
        return { ...old, is_following: !isCurrentlyFollowing, follower_count: old.follower_count + (isCurrentlyFollowing ? -1 : 1) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['profile', username], ctx.prev);
    },
  });

  if (profileLoading) {
    return (
      <AppShell hideRight>
        <div className="-mt-6">
          <div className="h-48 md:h-64 yt-gradient-cta rounded-b-2xl" />
          <div className="px-4 -mt-14"><div className="h-28 w-28 rounded-full ring-4 ring-background bg-muted" /></div>
          <div className="px-4 mt-6"><FeedSkeleton /></div>
        </div>
      </AppShell>
    );
  }

  if (profileError || !profile) {
    return (
      <AppShell hideRight>
        <div className="p-4 max-w-lg mx-auto mt-12">
          <InlineError message="Couldn't load this profile." onRetry={refetch} />
        </div>
      </AppShell>
    );
  }

  const posts = postsData?.data ?? [];
  const followers = followersData?.data ?? [];
  const following = followingData?.data ?? [];

  return (
    <AppShell hideRight>
      <div className="-mt-6">
        <div className="h-48 md:h-64 yt-gradient-cta rounded-b-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="px-4 -mt-14 relative">
          <img src={profile.avatar_url ?? ''} className="h-28 w-28 rounded-full ring-4 ring-background object-cover" alt={profile.full_name} />
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{profile.full_name}</h1>
              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                {profile.campus_name && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.campus_name}{profile.department ? ' · ' + profile.department : ''}</span>
                )}
                {profile.year_of_study && <span>Level {profile.year_of_study}</span>}
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              {profile.bio && <p className="mt-3 max-w-xl text-sm">{profile.bio}</p>}
            </div>
            {!isOwner && currentUser && (
              <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => followMutation.mutate()} disabled={followMutation.isPending}>
                  {isCurrentlyFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline">Message</Button>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3 max-w-lg">
            <Stat label="Posts" value={profile.post_count} />
            <Stat label="Followers" value={profile.follower_count} />
            <Stat label="Following" value={profile.following_count} />
            <Stat label="Total Claps" value={profile.total_claps_received} />
          </div>

          <Tabs defaultValue="posts" className="mt-8">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto w-full justify-start">
              {["posts", "followers", "following", "about"].map((v) => (
                <TabsTrigger key={v} value={v} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 pb-3 shadow-none">{v}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="posts" className="pt-6 grid md:grid-cols-2 gap-4">
              {postsLoading ? <FeedSkeleton /> : posts.length ? posts.map((p) => <PostCard key={p.id} post={p} />) : <p className="text-muted-foreground">No posts yet.</p>}
            </TabsContent>
            <TabsContent value="followers" className="pt-6">
              {followersLoading ? <FeedSkeleton /> : followers.length ? (
                <div className="space-y-3">
                  {followers.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 yt-card p-3">
                      <img src={f.avatar_url ?? ''} alt={f.full_name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-sm">{f.full_name}</div>
                        <div className="text-xs text-muted-foreground">@{f.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No followers yet.</p>}
            </TabsContent>
            <TabsContent value="following" className="pt-6">
              {followingLoading ? <FeedSkeleton /> : following.length ? (
                <div className="space-y-3">
                  {following.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 yt-card p-3">
                      <img src={f.avatar_url ?? ''} alt={f.full_name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-sm">{f.full_name}</div>
                        <div className="text-xs text-muted-foreground">@{f.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">Not following anyone yet.</p>}
            </TabsContent>
            <TabsContent value="about" className="pt-6 text-sm">{profile.bio || 'No bio yet.'}</TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="yt-card p-3 text-center">
    <div className="text-lg font-extrabold">{value.toLocaleString()}</div>
    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
  </div>
);

export default Profile;
