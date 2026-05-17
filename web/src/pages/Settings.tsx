import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, refetch } = useAuth();

  const [name, setName] = useState(user?.full_name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');

  const updateProfile = useMutation({
    mutationFn: (data: { full_name?: string; bio?: string; department?: string }) =>
      api.patch('/auth/me', data).then(unwrap),
    onSuccess: () => { refetch(); toast.success('Profile updated.'); },
    onError: () => toast.error('Failed to update profile.'),
  });

  const updateLanguage = useMutation({
    mutationFn: (language: string) =>
      api.patch('/auth/language', { language }).then(unwrap),
    onSuccess: () => { refetch(); toast.success('Language preference updated.'); },
    onError: () => toast.error('Failed to update language.'),
  });

  const handleSave = () => {
    updateProfile.mutate({ full_name: name, bio, department });
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
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Username" value={user?.username ?? ''} readOnly />
            <Field label="Email" value={user?.email ?? ''} readOnly />
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

const Field = ({ label, value, onChange, readOnly }: { label: string; value?: string; onChange?: (v: string) => void; readOnly?: boolean }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    <Input value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} />
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
