import { AppShell } from "@/components/layout/AppShell";
import { useParams } from "react-router-dom";
import { users, posts, currentUser } from "@/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/PostCard";
import { Calendar, MapPin } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const user = users.find((u) => u.username === username) ?? currentUser;
  const userPosts = posts.filter((p) => p.author.id === user.id);

  return (
    <AppShell hideRight>
      <div className="-mt-6">
        <div className="h-48 md:h-64 yt-gradient-cta rounded-b-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="px-4 -mt-14 relative">
          <img src={user.avatar} className="h-28 w-28 rounded-full ring-4 ring-background object-cover" alt={user.name} />
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{user.name}</h1>
              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.campus} · {user.department}</span>
                <span>{user.year}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {user.joinedAt}</span>
              </div>
              <p className="mt-3 max-w-xl text-sm">{user.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">Follow</Button>
              <Button variant="outline">Message</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3 max-w-lg">
            <Stat label="Posts" value={userPosts.length} />
            <Stat label="Followers" value={user.followers ?? 0} />
            <Stat label="Following" value={user.following ?? 0} />
            <Stat label="Total Claps" value={user.totalClaps ?? 0} />
          </div>

          <Tabs defaultValue="posts" className="mt-8">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto w-full justify-start">
              {["posts", "drafts", "bookmarks", "about"].map((v) => (
                <TabsTrigger key={v} value={v} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 pb-3 shadow-none">{v}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="posts" className="pt-6 grid md:grid-cols-2 gap-4">
              {userPosts.length ? userPosts.map((p) => <PostCard key={p.id} post={p} />) : <p className="text-muted-foreground">No posts yet.</p>}
            </TabsContent>
            <TabsContent value="drafts" className="pt-6 text-sm text-muted-foreground">No drafts. Start writing →</TabsContent>
            <TabsContent value="bookmarks" className="pt-6 grid md:grid-cols-2 gap-4">
              {posts.slice(0, 2).map((p) => <PostCard key={p.id} post={p} />)}
            </TabsContent>
            <TabsContent value="about" className="pt-6 text-sm">{user.bio}</TabsContent>
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
