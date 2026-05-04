import { useState } from "react";
import { motion } from "framer-motion";
import { Pin, Eye, Pencil, EyeOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAnnouncements } from "@/mock/campusAdmin";

const CampusAdminAnnouncements = () => {
  const [scheduled, setScheduled] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6">
        {/* Composer */}
        <div className="yt-card p-6 space-y-4">
          <h2 className="text-lg font-extrabold">New Announcement</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title</label>
            <Input placeholder="A short, clear title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Body</label>
            <Textarea rows={5} placeholder="Write the announcement here..." className="resize-y" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Visibility</label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="writers">Writers Only</SelectItem>
                <SelectItem value="mods">Moderators Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="text-sm">
              <div className="font-semibold">Pin to feed</div>
              <div className="text-xs text-muted-foreground">Stick this to the top of the campus feed</div>
            </div>
            <Switch />
          </div>

          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold">Schedule for later</div>
                <div className="text-xs text-muted-foreground">{scheduled ? "Pick a date and time" : "Post immediately"}</div>
              </div>
              <Switch checked={scheduled} onCheckedChange={setScheduled} />
            </div>
            {scheduled && <Input type="datetime-local" />}
          </div>

          <div className="space-y-2 pt-2">
            <Button className="w-full">Publish Announcement</Button>
            <Button variant="ghost" className="w-full">Save as Draft</Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold mb-1">Published Announcements</h2>
          {mockAnnouncements.map((a) => (
            <div key={a.id} className="yt-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Official</span>
                {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                <span className="ml-auto text-xs text-muted-foreground">{a.date}</span>
              </div>
              <div className="font-semibold text-sm">{a.title}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.visibility}</span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{a.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-border">
                <button className="h-8 px-2 text-xs inline-flex items-center gap-1 rounded hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button className="h-8 px-2 text-xs inline-flex items-center gap-1 rounded hover:bg-secondary"><EyeOff className="h-3.5 w-3.5" /> Unpublish</button>
                <button className="h-8 px-2 text-xs inline-flex items-center gap-1 rounded hover:bg-red-500/10 text-red-500"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CampusAdminAnnouncements;
