import { AppShell } from "@/components/layout/AppShell";
import { notifications } from "@/mock";

const Notifications = () => {
  const groups = ["Today", "This Week"] as const;
  return (
    <AppShell hideRight>
      <h1 className="text-3xl font-extrabold mb-6">Notifications</h1>
      <div className="space-y-8 max-w-2xl">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">{g}</h2>
            <div className="yt-card divide-y divide-border">
              {notifications.filter((n) => n.group === g).map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-primary/5" : ""}`}>
                  <span className="h-9 w-9 rounded-full bg-secondary inline-flex items-center justify-center text-lg shrink-0">{n.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
};

export default Notifications;
