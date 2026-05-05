import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, TriangleAlert, GripVertical, Trash2, Lock, Plus, Mail, HardDrive, BarChart3, MessageSquare, Globe, Download, EyeOff, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CATEGORIES } from "@/lib/constants";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const SuperAdminPlatformSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [cats, setCats] = useState(CATEGORIES.map((c) => ({ ...c, active: true })));

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
            <div><Label>Platform Name</Label><Input defaultValue="YouthTrend" /></div>
            <div><Label>Platform Tagline</Label><Input defaultValue="Campus stories, told by students." /></div>
            <div>
              <Label>Platform Logo</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 transition cursor-pointer">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Click to upload (SVG/PNG, max 1MB)</span>
              </div>
            </div>
            <div>
              <Label>Default Language</Label>
              <RadioGroup defaultValue="both" className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="en" /> English</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="fr" /> French</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="both" /> Both</label>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Take the platform offline for everyone except Super Admins.</p>
              </div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
            {maintenance && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs p-3 flex gap-2">
                <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
                Maintenance mode will make the platform inaccessible to all users except Super Admins.
              </div>
            )}
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="registration" className="mt-5 space-y-5 max-w-2xl">
          <div className="yt-card p-5 space-y-4">
            <div>
              <Label>Global Registration Mode</Label>
              <RadioGroup defaultValue="open" className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="open" /> Open — anyone with a campus email</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="invite" /> Invite Only</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="closed" /> Closed</label>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div><Label>Require Campus Email</Label><p className="text-xs text-muted-foreground">Only allow signups from approved domains.</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 opacity-60">
              <div><Label>Email Verification Required</Label><p className="text-xs text-muted-foreground">Cannot be disabled.</p></div>
              <Switch checked disabled />
            </div>
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-5 space-y-5 max-w-3xl">
          <div className="yt-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Max post length</Label>
                <Select defaultValue="10000"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5000">5,000 words</SelectItem><SelectItem value="10000">10,000 words</SelectItem><SelectItem value="20000">20,000 words</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label>Max image upload size</Label>
                <Select defaultValue="5"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">2 MB</SelectItem><SelectItem value="5">5 MB</SelectItem><SelectItem value="10">10 MB</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 opacity-60">
              <div className="flex items-center gap-2">
                <Tooltip><TooltipTrigger><Lock className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Phase 3+ feature</TooltipContent></Tooltip>
                <div><Label>Allow video content</Label><p className="text-xs text-muted-foreground">Phase 3+ feature, currently disabled.</p></div>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label>Auto-profanity filter</Label>
              <Switch defaultChecked />
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Content categories</Label>
                <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Add Category</Button>
              </div>
              <div className="space-y-1.5">
                {cats.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 p-2 rounded-md border border-border">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Input className="w-16 text-center" defaultValue={(c as any).emoji} />
                    <Input className="flex-1" defaultValue={c.name} />
                    <Switch checked={c.active} onCheckedChange={(v) => setCats(cats.map((x, j) => j === i ? { ...x, active: v } : x))} />
                    <Button size="icon" variant="ghost" className="text-red-400 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <Button>Save Changes</Button>
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
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-5 space-y-3 max-w-3xl">
          {[
            { name: "Mail provider",  desc: "SMTP / SendGrid for email delivery",                     icon: Mail,           connected: true },
            { name: "Storage",        desc: "Cloudflare R2 / S3 for media files",                     icon: HardDrive,      connected: true },
            { name: "Analytics",      desc: "Custom analytics (built-in)",                            icon: BarChart3,      connected: true },
            { name: "SMS",            desc: "MTN / Orange notifications for Cameroonian mobiles",     icon: MessageSquare,  connected: false, phase4: true },
            { name: "OAuth Google",   desc: "Google sign-in for campus Gmail Workspace accounts",     icon: Globe,          connected: false },
          ].map((it) => (
            <div key={it.name} className="yt-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 inline-flex items-center justify-center text-primary"><it.icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{it.name}</span>
                  {it.phase4 && <Badge variant="secondary" className="text-[10px]">Phase 4</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{it.desc}</div>
              </div>
              <Badge className={it.connected ? "bg-primary/15 text-primary hover:bg-primary/15" : "bg-secondary text-muted-foreground"}>
                {it.connected ? "Connected" : "Not Connected"}
              </Badge>
              <Button variant="outline" size="sm" disabled={!!it.phase4}>{it.connected ? "Configure" : "Connect"}</Button>
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
                <div className="font-semibold text-sm">Export All Platform Data</div>
                <p className="text-xs text-muted-foreground">Download a full CSV export of all users, posts, and moderation logs.</p>
              </div>
              <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-red-500/20 pt-4">
              <div>
                <div className="font-semibold text-sm">Put Platform in Read-Only Mode</div>
                <p className="text-xs text-muted-foreground">Users can read but not post, comment, or interact. Reversible.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"><EyeOff className="h-4 w-4 mr-1.5" /> Enable Read-Only</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-amber-400" /> Enable read-only mode?</AlertDialogTitle><AlertDialogDescription>All write actions will be disabled across the platform.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Enable</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-red-500/20 pt-4">
              <div>
                <div className="font-semibold text-sm">Reset Platform to Factory Defaults</div>
                <p className="text-xs text-muted-foreground">Deletes all campuses, users, and content. This CANNOT be undone.</p>
              </div>
              <AlertDialog onOpenChange={() => setResetConfirm("")}>
                <AlertDialogTrigger asChild>
                  <Button className="bg-red-500 hover:bg-red-600 text-white"><RotateCcw className="h-4 w-4 mr-1.5" /> Reset Platform</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Reset Platform?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. To confirm, type <span className="font-mono font-bold text-red-400">DELETE YOUTHTREND</span> below.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder="DELETE YOUTHTREND" className="font-mono" />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={resetConfirm !== "DELETE YOUTHTREND"} className="bg-red-500 hover:bg-red-600">Reset Platform Permanently</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SuperAdminPlatformSettings;
