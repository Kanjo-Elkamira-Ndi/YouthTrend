import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/ThemeContext";
import { useAuth, type AppUser } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { Camera, Loader2, Building2, CheckCircle2, XCircle, Clock, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { initials, resolveMediaUrl } from "@/lib/media";
import type { CampusRow } from "@/types/campus";
import type { CampusJoinFull } from "@/types/campus-join";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, refetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.full_name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  useEffect(() => {
    setName(user?.full_name ?? '');
    setBio(user?.bio ?? '');
    setDepartment(user?.department ?? '');
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: Record<string, string>) =>
      api.patch('/auth/me', data).then(unwrap),
    onSuccess: () => { refetch(); toast.success('Profile updated.'); },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(msg);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return api.post('/auth/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(unwrap);
    },
    onSuccess: () => { refetch(); toast.success('Avatar updated.'); },
    onError: () => toast.error('Failed to upload avatar.'),
  });

  const updateLanguage = useMutation({
    mutationFn: (language: string) =>
      api.patch('/auth/language', { language }).then(unwrap),
    onSuccess: () => { refetch(); toast.success('Language preference updated.'); },
    onError: () => toast.error('Failed to update language.'),
  });

  const handleSave = () => {
    const payload: Record<string, string> = {};
    if (name !== user?.full_name) payload.fullName = name;
    if (bio !== (user?.bio ?? '')) payload.bio = bio;
    if (department !== (user?.department ?? '')) payload.department = department;
    if (Object.keys(payload).length === 0) {
      toast.error('No changes to save.');
      return;
    }
    updateProfile.mutate(payload);
  };

  return (
    <AppShell hideRight>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6">Settings</h1>
        <Tabs defaultValue="account">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto w-full justify-start">
            {["account", "notifications", "privacy", "campus", "appearance"].map((v) => (
              <TabsTrigger key={v} value={v} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 pb-3 shadow-none">{v}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="account" className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={resolveMediaUrl(user?.avatar_url)} />
                  <AvatarFallback className="text-lg">{initials(user?.full_name)}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatar.isPending}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadAvatar.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar.mutate(file);
                  }}
                />
              </div>
              <div>
                <div className="font-semibold">{user?.full_name}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {user?.role?.replace('_', ' ')}
                  {user?.campus_name ? ` · ${user.campus_name}` : ''}
                  {user?.department ? ` · ${user.department}` : ''}
                </div>
              </div>
            </div>

            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Username" value={username} readOnly />
            <Field label="Email" value={email} readOnly type="email" />
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Bio</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="pt-6 space-y-4">
            <Row label="Push notifications" desc="On your devices" />
            <Row label="Comment alerts" desc="When someone replies to you" />
            <Row label="Weekly digest" desc="Top posts from your campus" />
          </TabsContent>

          <TabsContent value="privacy" className="pt-6 space-y-4">
            <Row label="Private profile" desc="Only followers can see your posts" />
            <Row label="Hide claps from feed" desc="Don't surface posts you've clapped" />
          </TabsContent>

          <TabsContent value="campus" className="pt-6 space-y-5">
            <CampusSection user={user} />
          </TabsContent>

          <TabsContent value="appearance" className="pt-6 space-y-5">
            <div className="flex items-center justify-between yt-card p-4">
              <div>
                <div className="font-semibold">Theme</div>
                <div className="text-sm text-muted-foreground">Currently {theme}</div>
              </div>
              <Button variant="outline" onClick={toggleTheme}>Toggle</Button>
            </div>
            <div className="flex items-center justify-between yt-card p-4">
              <div>
                <div className="font-semibold">Language</div>
                <div className="text-sm text-muted-foreground">{user?.language_pref === 'fr' ? 'Français' : 'English'}</div>
              </div>
              <Button variant="outline" onClick={() => updateLanguage.mutate(user?.language_pref === 'fr' ? 'en' : 'fr')}>
                Switch
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

const CampusSection = ({ user }: { user: AppUser | null }) => {
  const [selectedCampusId, setSelectedCampusId] = useState("");

  const { data: campuses, isLoading: campusesLoading } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => api.get('/campuses').then(unwrap<CampusRow[]>),
  });

  const { data: joinRequest, isLoading: requestLoading, refetch: refetchRequest } = useQuery({
    queryKey: ['campus-join-mine'],
    queryFn: () => api.get('/campus-join/mine').then(unwrap<CampusJoinFull | null>),
  });

  const submitRequest = useMutation({
    mutationFn: (campusId: string) =>
      api.post('/campus-join', { campusId }).then(unwrap),
    onSuccess: () => {
      refetchRequest();
      toast.success('Join request submitted. The campus admin will review it.');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to submit request.';
      toast.error(msg);
    },
  });

  if (!user) return null;

  if (user.campus_id) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 yt-card p-4">
          <div className="h-12 w-12 rounded-full bg-primary/15 inline-flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">{user.campus_name}</div>
            <div className="text-sm text-muted-foreground">You are a member of this campus</div>
          </div>
        </div>
      </div>
    );
  }

  if (requestLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (joinRequest?.status === 'pending') {
    return (
      <div className="yt-card p-6 text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-amber-500/10 inline-flex items-center justify-center mx-auto">
          <Clock className="h-7 w-7 text-amber-500" />
        </div>
        <h3 className="font-bold text-lg">Request pending approval</h3>
        <p className="text-sm text-muted-foreground">
          Your request to join <strong>{joinRequest.campus_name}</strong> is being reviewed by the campus admin.
        </p>
        <p className="text-xs text-muted-foreground">
          Submitted on {new Date(joinRequest.created_at).toLocaleDateString()}
        </p>
      </div>
    );
  }

  if (joinRequest?.status === 'approved') {
    return (
      <div className="yt-card p-6 text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-green-500/10 inline-flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <h3 className="font-bold text-lg">Welcome to {joinRequest.campus_name}!</h3>
        <p className="text-sm text-muted-foreground">
          Your request was approved. You can now publish articles under this campus.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  if (joinRequest?.status === 'declined') {
    return (
      <div className="yt-card p-6 text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-red-500/10 inline-flex items-center justify-center mx-auto">
          <XCircle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="font-bold text-lg">Request declined</h3>
        {joinRequest.reviewer_note && (
          <p className="text-sm italic text-muted-foreground">"{joinRequest.reviewer_note}"</p>
        )}
        <p className="text-sm text-muted-foreground">
          Your request to join <strong>{joinRequest.campus_name}</strong> was not approved.
        </p>
        <p className="text-xs text-muted-foreground">You can reapply after 14 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-lg">Join a campus</h3>
        <p className="text-sm text-muted-foreground">
          Select your university or school to start publishing articles.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">University / Campus</Label>
        <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a campus..." />
          </SelectTrigger>
          <SelectContent>
            {campusesLoading ? (
              <SelectItem value="" disabled>Loading campuses...</SelectItem>
            ) : (
              (campuses ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.short_code})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="gap-2"
        disabled={!selectedCampusId || submitRequest.isPending}
        onClick={() => submitRequest.mutate(selectedCampusId)}
      >
        <Send className="h-4 w-4" />
        {submitRequest.isPending ? 'Submitting...' : 'Request to Join'}
      </Button>
    </div>
  );
};

const Field = ({ label, value, onChange, readOnly, type }: { label: string; value?: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    <Input value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} type={type ?? 'text'} />
  </div>
);

const Row = ({ label, desc }: { label: string; desc: string }) => (
  <div className="flex items-center justify-between yt-card p-4">
    <div>
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
    <Switch defaultChecked />
  </div>
);

export default Settings;
