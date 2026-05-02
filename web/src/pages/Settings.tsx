import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { currentUser } from "@/mock";

const Settings = () => {
  const { theme, toggleTheme, lang, toggleLang } = useTheme();
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
            <Field label="Full Name" defaultValue={currentUser.name} />
            <Field label="Username" defaultValue={currentUser.username} />
            <Field label="Email" defaultValue="amara@uy1.cm" />
            <Field label="Bio" defaultValue={currentUser.bio} />
            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
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
                <div className="text-sm text-muted-foreground">{lang === "en" ? "English" : "Français"}</div>
              </div>
              <Button variant="outline" onClick={toggleLang}>Switch</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

const Field = ({ label, defaultValue }: { label: string; defaultValue?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    <Input defaultValue={defaultValue} />
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
