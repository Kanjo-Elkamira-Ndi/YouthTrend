import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TriangleAlert, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import type { PlatformSettingsRow } from "@/types/analytics";

const SuperAdminPlatformSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/admin/settings').then(unwrap<PlatformSettingsRow>),
  });

  const [form, setForm] = useState<Partial<PlatformSettingsRow>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch('/admin/settings', payload).then(unwrap<PlatformSettingsRow>),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'settings'], updated);
      toast.success('Settings saved.');
    },
    onError: () => toast.error('Failed to save settings.'),
  });

  if (isLoading) return <div className="p-6"><FeedSkeleton /></div>;
  if (isError || !form) return <div className="p-6"><InlineError message="Failed to load settings" /></div>;

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6">
      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="danger" className="data-[state=active]:text-red-400">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-5 space-y-5 max-w-2xl">
          <div className="yt-card p-5 space-y-4">
            <div>
              <Label>Platform Name</Label>
              <Input value={form.platform_name ?? ''} onChange={(e) => set('platform_name', e.target.value)} />
            </div>
            <div>
              <Label>Platform Tagline</Label>
              <Input value={form.platform_tagline ?? ''} onChange={(e) => set('platform_tagline', e.target.value)} />
            </div>
            <div>
              <Label>Platform Logo</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 transition cursor-pointer">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Click to upload (SVG/PNG, max 1MB)</span>
              </div>
            </div>
            <div>
              <Label>Default Language</Label>
              <RadioGroup value={form.default_language ?? 'en'} onValueChange={(v) => set('default_language', v)} className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="en" /> English</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="fr" /> French</label>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Take the platform offline for everyone except Super Admins.</p>
              </div>
              <Switch checked={form.maintenance_mode ?? false} onCheckedChange={(v) => set('maintenance_mode', v)} />
            </div>
            {form.maintenance_mode && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs p-3 flex gap-2">
                <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
                Maintenance mode will make the platform inaccessible to all users except Super Admins.
              </div>
            )}
            <Button onClick={() => updateMutation.mutate({
              platformName: form.platform_name,
              platformTagline: form.platform_tagline,
              defaultLanguage: form.default_language,
              maintenanceMode: form.maintenance_mode,
            })}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="registration" className="mt-5 space-y-5 max-w-2xl">
          <div className="yt-card p-5 space-y-4">
            <div>
              <Label>Global Registration Mode</Label>
              <RadioGroup value={form.registration_mode ?? 'open'} onValueChange={(v) => set('registration_mode', v)} className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="open" /> Open — anyone with a campus email</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="invite_only" /> Invite Only</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="closed" /> Closed</label>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div><Label>Require Campus Email</Label><p className="text-xs text-muted-foreground">Only allow signups from approved domains.</p></div>
              <Switch checked={form.require_campus_email ?? true} onCheckedChange={(v) => set('require_campus_email', v)} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 opacity-60">
              <div><Label>Email Verification Required</Label><p className="text-xs text-muted-foreground">Cannot be disabled.</p></div>
              <Switch checked={form.email_verification_required ?? true} disabled />
            </div>
            <Button onClick={() => updateMutation.mutate({
              registrationMode: form.registration_mode,
              requireCampusEmail: form.require_campus_email,
            })}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-5 space-y-5 max-w-3xl">
          <div className="yt-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Max post length</Label>
                <Select value={String(form.max_post_length_words ?? 10000)} onValueChange={(v) => set('max_post_length_words', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000">5,000 words</SelectItem>
                    <SelectItem value="10000">10,000 words</SelectItem>
                    <SelectItem value="20000">20,000 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max image upload size</Label>
                <Select value={String(form.max_image_size_mb ?? 5)} onValueChange={(v) => set('max_image_size_mb', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 MB</SelectItem>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label>Auto-profanity filter</Label>
              <Switch checked={form.auto_profanity_filter ?? true} onCheckedChange={(v) => set('auto_profanity_filter', v)} />
            </div>
            <Button onClick={() => updateMutation.mutate({
              maxPostLengthWords: form.max_post_length_words,
              maxImageSizeMb: form.max_image_size_mb,
              autoProfanityFilter: form.auto_profanity_filter,
            })}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5 space-y-5 max-w-2xl">
          <div className="yt-card p-5 space-y-3">
            {[
              "New campus registration request",
              "Report escalated to Super Admin",
              "Platform error / downtime alert",
              "Weekly analytics digest",
              "New user milestone (every 1,000 users)",
            ].map((t, i) => (
              <div key={t} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <Label className="font-normal">{t}</Label>
                <Switch defaultChecked={i % 2 === 0} />
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <Label>Notification email address</Label>
              <Input defaultValue="alerts@youthtrend.cm" />
            </div>
            <Button onClick={() => toast.success('Notification settings saved.')}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-5 space-y-3 max-w-3xl">
          {[
            { name: "Mail provider",  desc: "SMTP / SendGrid for email delivery",                     connected: true },
            { name: "Storage",        desc: "Cloudflare R2 / S3 for media files",                     connected: true },
            { name: "Analytics",      desc: "Custom analytics (built-in)",                            connected: true },
            { name: "SMS",            desc: "MTN / Orange notifications for Cameroonian mobiles",     connected: false, phase4: true },
            { name: "OAuth Google",   desc: "Google sign-in for campus Gmail Workspace accounts",     connected: false },
          ].map((it) => (
            <div key={it.name} className="yt-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 inline-flex items-center justify-center text-primary text-lg font-bold">{it.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{it.name}</span>
                  {(it as any).phase4 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">Phase 4</span>}
                </div>
                <div className="text-xs text-muted-foreground">{it.desc}</div>
              </div>
              <span className={`text-xs font-semibold ${it.connected ? "text-primary" : "text-muted-foreground"}`}>
                {it.connected ? "Connected" : "Not Connected"}
              </span>
              <Button variant="outline" size="sm" disabled={!!(it as any).phase4}>{it.connected ? "Configure" : "Connect"}</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="danger" className="mt-5">
          <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-6 max-w-3xl space-y-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-red-400"><TriangleAlert className="h-5 w-5" /> Danger Zone</h2>
              <p className="text-sm text-muted-foreground">These actions are irreversible. Proceed with extreme caution.</p>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-red-500/20 pt-4">
              <div>
                <div className="font-semibold text-sm">Maintenance Mode</div>
                <p className="text-xs text-muted-foreground">Toggle from the General tab.</p>
              </div>
              <Switch checked={form.maintenance_mode ?? false} onCheckedChange={(v) => {
                set('maintenance_mode', v);
                updateMutation.mutate({ maintenanceMode: v });
              }} />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-red-500/20 pt-4">
              <div>
                <div className="font-semibold text-sm">Export All Platform Data</div>
                <p className="text-xs text-muted-foreground">Download a full CSV export of all users, posts, and moderation logs.</p>
              </div>
              <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" onClick={() => toast.success('Export initiated.')}>Export</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SuperAdminPlatformSettings;
