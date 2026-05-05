// Mock data for the Super Admin Panel. Illustrative only.

const av = (s: string) => `https://i.pravatar.cc/150?u=${s}`;
const cover = (n: number) => `https://picsum.photos/seed/yt-sa-${n}/200/200`;

export const mockPlatformStats = [
  { key: "campuses", label: "Total Campuses", value: "5",      trend: "+2 this month",       dir: "up" as const },
  { key: "users",    label: "Total Users",    value: "6,284",  trend: "+312 this week",      dir: "up" as const },
  { key: "posts",    label: "Total Posts",    value: "14,720", trend: "+847 this week",      dir: "up" as const },
  { key: "views",    label: "Total Views",    value: "284k",   trend: "+12% this week",      dir: "up" as const },
  { key: "reports",  label: "Open Reports",   value: "24",     trend: "+6 since yesterday",  dir: "up" as const },
  { key: "growth",   label: "Platform Growth",value: "+18%",   trend: "vs last month",       dir: "up" as const },
];

const spark = (seed: number) =>
  Array.from({ length: 7 }, (_, i) => ({
    d: i,
    v: Math.round(40 + Math.sin(i + seed) * 12 + (i * (seed % 5))),
  }));

export const mockCampusHealth = [
  { id: "uy1",  emoji: "🏫", name: "University of Yaoundé I",  short: "UY1", status: "Active"   as const, users: 1840, posts: 4210, reports: 8,  spark: spark(1), joined: "2023-09-12" },
  { id: "ub",   emoji: "🌊", name: "University of Buea",        short: "UB",  status: "Active"   as const, users: 1260, posts: 3120, reports: 4,  spark: spark(2), joined: "2023-11-04" },
  { id: "iubs", emoji: "📚", name: "IUBS",                       short: "IUBS",status: "Active"   as const, users: 980,  posts: 2740, reports: 3,  spark: spark(3), joined: "2024-02-18" },
  { id: "udl",  emoji: "🎓", name: "University of Douala",       short: "UDL", status: "Active"   as const, users: 1420, posts: 3680, reports: 9,  spark: spark(4), joined: "2024-06-22" },
  { id: "ub2",  emoji: "🏔️", name: "University of Buea 2",       short: "UB2", status: "Inactive" as const, users: 784,  posts: 970,  reports: 0,  spark: spark(5), joined: "2024-09-01" },
];

export type SARole = "Super Admin" | "Campus Admin" | "Moderator" | "Writer" | "Reader";
export type SAStatus = "Active" | "Suspended" | "Banned";

export const mockAllUsers = [
  { id: "su1",  name: "Jordan Ndi",         email: "jordan@youthtrend.cm",     avatar: av("jordan"),    campus: "Platform", role: "Super Admin"   as SARole, status: "Active"    as SAStatus, posts: 0,   joined: "2023-08-01", lastActive: "Just now" },
  { id: "su2",  name: "Fatima Nkemdirim",   email: "fatima.nkem@uy1.cm",       avatar: av("fatima"),    campus: "UY1",      role: "Campus Admin"  as SARole, status: "Active"    as SAStatus, posts: 87,  joined: "2024-03-12", lastActive: "2h ago" },
  { id: "su3",  name: "Eric Atangana",      email: "eric.atangana@ub.cm",      avatar: av("eric"),      campus: "UB",       role: "Campus Admin"  as SARole, status: "Active"    as SAStatus, posts: 64,  joined: "2024-01-20", lastActive: "1d ago" },
  { id: "su4",  name: "Marie-Claire Foe",   email: "mc.foe@iubs.cm",           avatar: av("mclaire"),   campus: "IUBS",     role: "Campus Admin"  as SARole, status: "Active"    as SAStatus, posts: 42,  joined: "2024-04-05", lastActive: "5h ago" },
  { id: "su5",  name: "Patrick Mballa",     email: "patrick.mballa@udl.cm",    avatar: av("patrick"),   campus: "UDL",      role: "Campus Admin"  as SARole, status: "Active"    as SAStatus, posts: 58,  joined: "2024-06-22", lastActive: "30m ago" },
  { id: "su6",  name: "Grace Bekolo",       email: "grace.bekolo@uy1.cm",      avatar: av("grace"),     campus: "UY1",      role: "Moderator"     as SARole, status: "Active"    as SAStatus, posts: 23,  joined: "2024-05-10", lastActive: "1h ago" },
  { id: "su7",  name: "Amara Ngono",        email: "amara.ngono@uy1.cm",       avatar: av("amara"),     campus: "UY1",      role: "Writer"        as SARole, status: "Active"    as SAStatus, posts: 31,  joined: "2024-09-01", lastActive: "3h ago" },
  { id: "su8",  name: "Kofi Mbarga",        email: "kofi.mbarga@uy1.cm",       avatar: av("kofi"),      campus: "UY1",      role: "Writer"        as SARole, status: "Active"    as SAStatus, posts: 19,  joined: "2024-01-15", lastActive: "Yesterday" },
  { id: "su9",  name: "Chanceline Fouda",   email: "chanceline.f@uy1.cm",      avatar: av("chanceline"),campus: "UY1",      role: "Writer"        as SARole, status: "Suspended" as SAStatus, posts: 12,  joined: "2024-08-19", lastActive: "1w ago" },
  { id: "su10", name: "Blaise Eyong",       email: "blaise.eyong@ub.cm",       avatar: av("blaise"),    campus: "UB",       role: "Writer"        as SARole, status: "Active"    as SAStatus, posts: 27,  joined: "2024-02-12", lastActive: "4h ago" },
  { id: "su11", name: "Junior Ndi",         email: "junior.ndi@ub.cm",         avatar: av("junior"),    campus: "UB",       role: "Reader"        as SARole, status: "Active"    as SAStatus, posts: 0,   joined: "2024-10-02", lastActive: "2d ago" },
  { id: "su12", name: "Nadège Ekwalla",     email: "nadege.e@iubs.cm",         avatar: av("nadege"),    campus: "IUBS",     role: "Writer"        as SARole, status: "Active"    as SAStatus, posts: 15,  joined: "2024-07-22", lastActive: "8h ago" },
  { id: "su13", name: "Ibrahim Bello",      email: "ibrahim.bello@udl.cm",     avatar: av("ibrahim"),   campus: "UDL",      role: "Writer"        as SARole, status: "Active"    as SAStatus, posts: 22,  joined: "2024-08-14", lastActive: "12h ago" },
  { id: "su14", name: "Linda Etoundi",      email: "linda.etoundi@udl.cm",     avatar: av("linda"),     campus: "UDL",      role: "Reader"        as SARole, status: "Banned"    as SAStatus, posts: 3,   joined: "2024-09-30", lastActive: "3w ago" },
  { id: "su15", name: "Samuel Tchoumi",     email: "samuel.t@ub2.cm",          avatar: av("samuel"),    campus: "UB2",      role: "Reader"        as SARole, status: "Active"    as SAStatus, posts: 1,   joined: "2024-11-01", lastActive: "1w ago" },
];

export type SAPostStatus = "Published" | "Draft" | "Taken Down";

export const mockAllContent = Array.from({ length: 15 }, (_, i) => {
  const campuses = ["UY1", "UB", "IUBS", "UDL", "UB2"];
  const cats = ["Gist", "News", "Sports", "Academics", "Events", "Culture", "Opinion"];
  const statuses: SAPostStatus[] = ["Published","Published","Published","Published","Draft","Taken Down"];
  const authors = ["Amara Ngono","Kofi Mbarga","Fatima Nkemdirim","Blaise Eyong","Chanceline Fouda","Ibrahim Bello","Nadège Ekwalla","Linda Etoundi"];
  const status = statuses[i % statuses.length];
  return {
    id: `sap${i+1}`,
    title: [
      "FMBS Final Year Results: What You Need to Know",
      "UY1 vs UB: Battle for the Cup Returns",
      "Surviving Exam Week in Ngoa-Ekellé",
      "Best Ndolé Spots Near Bonamoussadi",
      "Misleading Scholarship Post Removed",
      "Coding Club Hosts First Hackathon",
      "Inside the Faculty Strike: A Timeline",
      "Why I Switched From Law to CS",
      "Lost & Found: Campus Items This Month",
      "UY1 Library Now Open 24/7",
      "Behind the Scenes: Cultural Week",
      "Spam Wave: 'Free Wifi' Posts Removed",
      "Buea Climbs the Engineering Rankings",
      "Douala Fashion Week: Student Edition",
      "IUBS Welcomes New Cohort",
    ][i],
    excerpt: "A short summary that gives the reader context about this story.",
    cover: cover(i + 1),
    author: { name: authors[i % authors.length], avatar: av(authors[i % authors.length].toLowerCase().split(" ")[0]) },
    campus: campuses[i % campuses.length],
    category: cats[i % cats.length],
    views: 200 + i * 137,
    claps: 50 + i * 41,
    comments: 5 + i * 3,
    reports: i % 4 === 0 ? Math.floor(i / 2) : 0,
    status,
    saOverride: status === "Taken Down" && i % 2 === 0,
    date: `2026-04-${String(20 - i).padStart(2,"0")}`,
  };
});

export const mockGlobalReports = [
  { id: "r1", reason: "Spam",               reporter: "Grace Bekolo", reporterAvatar: av("grace"),    targetTitle: "Free iPhones at UY1 — DM me", targetCampus: "UY1",  status: "Pending" as const,    escalatedBy: "Grace Bekolo (UY1)",   note: "Repeated phishing pattern. Not within campus authority to ban platform-wide.", time: "Apr 28 · 14:32" },
  { id: "r2", reason: "Hate speech",        reporter: "Eric Atangana", reporterAvatar: av("eric"),    targetTitle: "Comment thread on UB rivalry post", targetCampus: "UB", status: "Pending" as const, escalatedBy: "Eric Atangana (UB)", note: "Targeted user belongs to a different campus.", time: "Apr 28 · 10:11" },
  { id: "r3", reason: "Harassment",         reporter: "Fatima Nkemdirim", reporterAvatar: av("fatima"), targetTitle: "Personal attack on student", targetCampus: "UY1", status: "Pending" as const, escalatedBy: undefined, note: undefined, time: "Apr 27 · 18:42" },
  { id: "r4", reason: "Misinformation",     reporter: "Marie-Claire Foe", reporterAvatar: av("mclaire"), targetTitle: "Fake scholarship deadline", targetCampus: "IUBS", status: "Pending" as const, escalatedBy: "Marie-Claire Foe (IUBS)", note: "Originated from off-platform group, may affect multiple campuses.", time: "Apr 27 · 09:30" },
  { id: "r5", reason: "Copyright",          reporter: "Patrick Mballa", reporterAvatar: av("patrick"), targetTitle: "Reposted news article without credit", targetCampus: "UDL", status: "Resolved" as const, escalatedBy: undefined, note: undefined, time: "Apr 26 · 16:00" },
  { id: "r6", reason: "Inappropriate",      reporter: "Junior Ndi", reporterAvatar: av("junior"),     targetTitle: "Explicit content in comments", targetCampus: "UB", status: "Resolved" as const, escalatedBy: "Eric Atangana (UB)", note: "Needs platform-wide ban consideration.", time: "Apr 26 · 11:15" },
  { id: "r7", reason: "Spam",               reporter: "Grace Bekolo", reporterAvatar: av("grace"),    targetTitle: "Crypto pump scheme post",     targetCampus: "UY1", status: "Dismissed" as const, escalatedBy: undefined, note: undefined, time: "Apr 25 · 21:04" },
  { id: "r8", reason: "Impersonation",      reporter: "Nadège Ekwalla", reporterAvatar: av("nadege"), targetTitle: "Fake account using rector's name", targetCampus: "IUBS", status: "Pending" as const, escalatedBy: "Marie-Claire Foe (IUBS)", note: "High visibility, requires platform-level take down.", time: "Apr 25 · 08:21" },
];

export const mockActivityFeed = [
  { id: 1, type: "campus",   icon: "UserPlus",    tone: "green" as const, text: "New campus registered: UDL",                  time: "10m ago" },
  { id: 2, type: "content",  icon: "FileText",    tone: "green" as const, text: "847 posts published today",                   time: "1h ago" },
  { id: 3, type: "report",   icon: "ShieldAlert", tone: "red" as const,   text: "6 new reports since yesterday",               time: "3h ago" },
  { id: 4, type: "user",     icon: "UserX",       tone: "red" as const,   text: "User banned: Linda Etoundi · UDL",            time: "5h ago" },
  { id: 5, type: "campus",   icon: "Building2",   tone: "green" as const, text: "Campus activated: IUBS",                      time: "Yesterday" },
  { id: 6, type: "settings", icon: "Settings2",   tone: "muted" as const, text: "Platform settings updated",                   time: "Yesterday" },
  { id: 7, type: "announce", icon: "Megaphone",   tone: "green" as const, text: "System announcement sent to all campuses",    time: "2d ago" },
  { id: 8, type: "user",     icon: "UserPlus",    tone: "green" as const, text: "312 new users this week",                     time: "2d ago" },
  { id: 9, type: "report",   icon: "ShieldAlert", tone: "red" as const,   text: "Escalation from UB: hate speech",             time: "3d ago" },
  { id: 10,type: "content",  icon: "FileText",    tone: "green" as const, text: "New category proposed: Tech",                 time: "4d ago" },
];

export const mockAuditLog = Array.from({ length: 20 }, (_, i) => {
  const actors = [
    { name: "Jordan Ndi",       avatar: av("jordan"),  role: "Super Admin"  as const },
    { name: "Fatima Nkemdirim", avatar: av("fatima"),  role: "Campus Admin" as const },
    { name: "Eric Atangana",    avatar: av("eric"),    role: "Campus Admin" as const },
    { name: "Grace Bekolo",     avatar: av("grace"),   role: "Moderator"    as const },
    { name: "Marie-Claire Foe", avatar: av("mclaire"), role: "Campus Admin" as const },
  ];
  const actions = [
    { text: "Took down post: Misleading Scholarship",      type: "content"      as const, target: "Misleading Scholarship",       campus: "UY1" },
    { text: "Suspended user: Chanceline Fouda",            type: "user"         as const, target: "Chanceline Fouda",             campus: "UY1" },
    { text: "Created campus: University of Douala",        type: "campus"       as const, target: "University of Douala",         campus: "Platform" },
    { text: "Changed role: Grace Bekolo → Moderator",      type: "user"         as const, target: "Grace Bekolo",                 campus: "UY1" },
    { text: "Updated platform settings",                   type: "settings"     as const, target: "Platform Settings",            campus: "Platform" },
    { text: "Dismissed report #r7",                        type: "moderation"   as const, target: "Report #r7",                   campus: "UY1" },
    { text: "Banned user: Linda Etoundi (platform-wide)",  type: "destructive"  as const, target: "Linda Etoundi",                campus: "Platform" },
    { text: "Pinned post: UY1 Library Now Open 24/7",      type: "content"      as const, target: "UY1 Library Now Open 24/7",    campus: "UY1" },
    { text: "Resolved report #r5",                         type: "moderation"   as const, target: "Report #r5",                   campus: "UDL" },
    { text: "Updated registration domains",                type: "settings"     as const, target: "Campus Settings",              campus: "IUBS" },
  ];
  const a = actions[i % actions.length];
  const actor = actors[i % actors.length];
  const day = String(28 - (i % 14)).padStart(2, "0");
  const hh = String((9 + i) % 24).padStart(2, "0");
  const mm = String((11 * i) % 60).padStart(2, "0");
  const ss = String((7 * i) % 60).padStart(2, "0");
  return {
    id: `log${i+1}`,
    timestamp: `2026-04-${day} ${hh}:${mm}:${ss}`,
    actor,
    action: a.text,
    actionType: a.type,
    target: a.target,
    campus: a.campus,
    ip: `41.205.${(i*7)%255}.${(i*13)%255}`,
  };
});

// Analytics
const dayLabel = (i: number) => {
  const d = new Date(2026, 3, 1 + i);
  return `${d.getMonth()+1}/${d.getDate()}`;
};

export const mockAnalyticsData = {
  growth: Array.from({ length: 30 }, (_, i) => ({
    name: dayLabel(i),
    users: Math.round(4200 + i * 70 + Math.sin(i / 3) * 40),
  })),
  postsDaily: Array.from({ length: 30 }, (_, i) => ({
    name: dayLabel(i),
    posts: Math.round(20 + Math.abs(Math.sin(i / 2)) * 35 + (i % 5) * 4),
  })),
  byCategory: [
    { name: "Gist",      value: 3210, fill: "#1A6E3C" },
    { name: "News",      value: 2780, fill: "#27AE60" },
    { name: "Sports",    value: 2105, fill: "#2ECC71" },
    { name: "Academics", value: 1980, fill: "#58D68D" },
    { name: "Events",    value: 1640, fill: "#82E0AA" },
    { name: "Culture",   value: 1520, fill: "#A9DFBF" },
    { name: "Opinion",   value: 1485, fill: "#D5F5E3" },
  ],
  campusComparison: [
    { name: "UY1",  posts: 4210, fill: "#1A6E3C" },
    { name: "UB",   posts: 3120, fill: "#27AE60" },
    { name: "IUBS", posts: 2740, fill: "#2ECC71" },
    { name: "UDL",  posts: 3680, fill: "#58D68D" },
    { name: "UB2",  posts: 970,  fill: "#82E0AA" },
  ],
  engagement: [
    { name: "UY1",  value: 78 },
    { name: "UDL",  value: 72 },
    { name: "UB",   value: 66 },
    { name: "IUBS", value: 61 },
    { name: "UB2",  value: 34 },
  ],
  weeklyActive: Array.from({ length: 12 }, (_, i) => ({
    name: `W${i + 1}`,
    UY1:  900  + i * 30 + (i % 3) * 20,
    UB:   620  + i * 22 + (i % 4) * 15,
    IUBS: 480  + i * 18 + (i % 2) * 12,
    UDL:  700  + i * 25 + (i % 3) * 17,
    UB2:  220  + i * 8,
  })),
};
