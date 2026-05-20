import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { Camera, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, refetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.full_name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

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
    if (username !== (user?.username ?? '')) payload.username = username;
    if (email !== (user?.email ?? '')) payload.email = email;
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
            {["account", "notifications", "privacy", "appearance"].map((v) => (
              <TabsTrigger key={v} value={v} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 pb-3 shadow-none">{v}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="account" className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar_url
                    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${import.meta.env.VITE_API_BASE_URL}${user.avatar_url}`)
                    : undefined} />
                  <AvatarFallback className="text-lg">{user?.full_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
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
              </div>
            </div>

            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Username" value={username} onChange={setUsername} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
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
