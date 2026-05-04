// Mock data for the Campus Admin dashboard. Names/dates are illustrative.

export const mockCampus = { emoji: "🏫", name: "University of Yaoundé I", short: "UY1" };

export const mockCampusStats = [
  { key: "students", label: "Total Students", value: "1,284", trend: 12, dir: "up" as const, sub: "this week" },
  { key: "posts", label: "Total Posts", value: "347", trend: 8, dir: "up" as const, sub: "this week" },
  { key: "reports", label: "Pending Reports", value: "12", trend: 3, dir: "up" as const, sub: "since yesterday" },
  { key: "views", label: "Total Views", value: "28.4k", trend: 22, dir: "up" as const, sub: "this week" },
];

const av = (s: string) => `https://i.pravatar.cc/150?u=${s}`;
const cover = (n: number) => `https://picsum.photos/seed/yt-admin-${n}/200/200`;

export type AdminPostStatus = "Published" | "Draft" | "Taken Down" | "Pinned";

export const mockRecentPosts = [
  { id: "ap1", title: "FMBS Final Year Results: What You Need to Know", excerpt: "A calm breakdown of the Level 500 results for the class of 2026.", author: { name: "Fatima Nkemdirim", avatar: av("fatima") }, category: "Academics", status: "Published" as AdminPostStatus, date: "2h ago", claps: 1240, comments: 87, cover: cover(1), pinned: true },
  { id: "ap2", title: "UY1 vs UB: The Battle for the Cup Returns", excerpt: "Inter-campus tournament heats up with the long-awaited rematch.", author: { name: "Kofi Mbarga", avatar: av("kofi") }, category: "Sports", status: "Published" as AdminPostStatus, date: "4h ago", claps: 980, comments: 54, cover: cover(2), pinned: false },
  { id: "ap3", title: "How to Survive Exam Week in Ngoa-Ekellé", excerpt: "Tips from students who've done it five times.", author: { name: "Amara Ngono", avatar: av("amara") }, category: "Opinion", status: "Draft" as AdminPostStatus, date: "Yesterday", claps: 0, comments: 0, cover: cover(3), pinned: false },
  { id: "ap4", title: "Campus Food Review: Best Ndolé Near Bonamoussadi", excerpt: "We tasted them all so you don't have to.", author: { name: "Chanceline Fouda", avatar: av("chanceline") }, category: "Culture", status: "Published" as AdminPostStatus, date: "2d ago", claps: 612, comments: 41, cover: cover(4), pinned: false },
  { id: "ap5", title: "Misleading Scholarship Post — Removed", excerpt: "We took down a viral post claiming free Canadian scholarships.", author: { name: "Junior Ndi", avatar: av("junior") }, category: "News", status: "Taken Down" as AdminPostStatus, date: "3d ago", claps: 220, comments: 12, cover: cover(5), pinned: false },
  { id: "ap6", title: "Coding Club Hosts First Hackathon", excerpt: "48 hours, 12 teams, one winner.", author: { name: "Blaise Eyong", avatar: av("blaise") }, category: "Events", status: "Published" as AdminPostStatus, date: "4d ago", claps: 470, comments: 28, cover: cover(6), pinned: true },
  { id: "ap7", title: "Inside the Faculty Strike: A Timeline", excerpt: "From the first communiqué to the final compromise.", author: { name: "Chanceline Fouda", avatar: av("chanceline") }, category: "News", status: "Published" as AdminPostStatus, date: "5d ago", claps: 815, comments: 102, cover: cover(7), pinned: false },
  { id: "ap8", title: "Why I Switched From Law to Computer Science", excerpt: "A personal essay about pivots and Yaoundé winters.", author: { name: "Amara Ngono", avatar: av("amara") }, category: "Opinion", status: "Published" as AdminPostStatus, date: "6d ago", claps: 530, comments: 33, cover: cover(8), pinned: false },
  { id: "ap9", title: "Lost & Found: Campus Items This Month", excerpt: "If you lost your jacket near Amphi 700 — read this.", author: { name: "Junior Ndi", avatar: av("junior") }, category: "Gist", status: "Draft" as AdminPostStatus, date: "1w ago", claps: 0, comments: 0, cover: cover(9), pinned: false },
  { id: "ap10", title: "UY1 Library Now Open 24/7 During Exam Period", excerpt: "Official announcement from the rectorate.", author: { name: "Fatima Nkemdirim", avatar: av("fatima") }, category: "News", status: "Published" as AdminPostStatus, date: "1w ago", claps: 1100, comments: 76, cover: cover(10), pinned: true },
  { id: "ap11", title: "Behind the Scenes: Campus Cultural Week", excerpt: "How student volunteers pulled it off in 3 weeks.", author: { name: "Kofi Mbarga", avatar: av("kofi") }, category: "Culture", status: "Published" as AdminPostStatus, date: "1w ago", claps: 690, comments: 49, cover: cover(11), pinned: false },
  { id: "ap12", title: "Spam: 'Free Wifi at Bonas' — Removed", excerpt: "Repeat spam pattern detected and taken down.", author: { name: "Blaise Eyong", avatar: av("blaise") }, category: "Gist", status: "Taken Down" as AdminPostStatus, date: "2w ago", claps: 30, comments: 4, cover: cover(12), pinned: false },
];

export type AdminUserRole = "Writer" | "Reader" | "Moderator" | "Suspended";
export type AdminUserStatus = "Active" | "Suspended";

export const mockUsers = [
  { id: "u1", name: "Amara Ngono",        email: "amara.ngono@uy1.cm",       avatar: av("amara"),       role: "Writer" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Sep 2024" },
  { id: "u2", name: "Kofi Mbarga",        email: "kofi.mbarga@uy1.cm",       avatar: av("kofi"),        role: "Writer" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Jan 2024" },
  { id: "u3", name: "Fatima Nkemdirim",   email: "fatima.nkem@uy1.cm",       avatar: av("fatima"),      role: "Moderator" as AdminUserRole, status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Mar 2024" },
  { id: "u4", name: "Blaise Eyong",       email: "blaise.eyong@uy1.cm",      avatar: av("blaise"),      role: "Reader" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Oct 2024" },
  { id: "u5", name: "Chanceline Fouda",   email: "chanceline.f@uy1.cm",      avatar: av("chanceline"),  role: "Writer" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Aug 2024" },
  { id: "u6", name: "Junior Ndi",         email: "junior.ndi@uy1.cm",        avatar: av("junior"),      role: "Writer" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Feb 2025" },
  { id: "u7", name: "Estelle Mbah",       email: "estelle.mbah@uy1.cm",      avatar: av("estelle"),     role: "Reader" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Apr 2025" },
  { id: "u8", name: "Patrice Toko",       email: "patrice.toko@uy1.cm",      avatar: av("patrice"),     role: "Suspended" as AdminUserRole, status: "Suspended" as AdminUserStatus, campus: "UY1", joined: "Nov 2024" },
  { id: "u9", name: "Sylvie Atangana",    email: "sylvie.atangana@uy1.cm",   avatar: av("sylvie"),      role: "Moderator" as AdminUserRole, status: "Active" as AdminUserStatus,    campus: "UY1", joined: "Dec 2023" },
  { id: "u10", name: "Hervé Bessala",     email: "herve.bessala@uy1.cm",     avatar: av("herve"),       role: "Reader" as AdminUserRole,    status: "Active" as AdminUserStatus,    campus: "UY1", joined: "May 2025" },
];

export type ReportReason = "Hate Speech" | "Misinformation" | "Spam" | "Explicit" | "Other";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";

export const mockReports = [
  { id: "r1", reporter: { name: "Estelle Mbah", avatar: av("estelle") }, time: "12 min ago", reason: "Hate Speech" as ReportReason, status: "Pending" as ReportStatus, target: { kind: "post" as const, title: "Open letter to the Faculty Dean", author: { name: "Patrice Toko", avatar: av("patrice") }, body: "We've had enough of this nonsense from the Dean. He's been targeting students from certain regions and it must stop now. The favoritism is plain to see for anyone with eyes." } },
  { id: "r2", reporter: { name: "Hervé Bessala", avatar: av("herve") }, time: "1h ago", reason: "Misinformation" as ReportReason, status: "Pending" as ReportStatus, target: { kind: "post" as const, title: "Government to give 500,000 FCFA to every student", author: { name: "Junior Ndi", avatar: av("junior") }, body: "Breaking: According to confirmed sources, the Ministry of Higher Education will deposit 500,000 FCFA into every registered student's account by Friday. Share this immediately." } },
  { id: "r3", reporter: { name: "Sylvie Atangana", avatar: av("sylvie") }, time: "3h ago", reason: "Spam" as ReportReason, status: "Pending" as ReportStatus, target: { kind: "comment" as const, title: "How to Survive Exam Week in Ngoa-Ekellé", author: { name: "Patrice Toko", avatar: av("patrice") }, body: "Click here for cheap Wi-Fi all over campus 👉 wifibonas.cm — best deal of the year, only 1000F!! tell your friends" } },
  { id: "r4", reporter: { name: "Amara Ngono", avatar: av("amara") }, time: "6h ago", reason: "Explicit" as ReportReason, status: "Resolved" as ReportStatus, resolvedBy: "Sylvie Atangana", resolvedAt: "2h ago", target: { kind: "comment" as const, title: "Campus Food Review: Best Ndolé Near Bonamoussadi", author: { name: "Anonymous", avatar: av("anon") }, body: "[explicit content removed]" } },
  { id: "r5", reporter: { name: "Blaise Eyong", avatar: av("blaise") }, time: "Yesterday", reason: "Other" as ReportReason, status: "Dismissed" as ReportStatus, resolvedBy: "Fatima Nkemdirim", resolvedAt: "20h ago", target: { kind: "post" as const, title: "Why I Switched From Law to Computer Science", author: { name: "Amara Ngono", avatar: av("amara") }, body: "I never thought I'd write this, but here we go. After two years of law school, I made the jump..." } },
  { id: "r6", reporter: { name: "Kofi Mbarga", avatar: av("kofi") }, time: "2 days ago", reason: "Misinformation" as ReportReason, status: "Pending" as ReportStatus, target: { kind: "post" as const, title: "UY1 to merge with University of Douala next year", author: { name: "Junior Ndi", avatar: av("junior") }, body: "Multiple sources confirm UY1 and UDS will merge into a single mega-university starting next academic year. Major reorganization expected." } },
];

export const mockAnnouncements = [
  { id: "a1", title: "Library now open 24/7 during exam period", date: "Apr 28", visibility: "All Students", pinned: true,  views: 1842 },
  { id: "a2", title: "Final exam timetable released",            date: "Apr 22", visibility: "All Students", pinned: true,  views: 2310 },
  { id: "a3", title: "Moderator training session this Friday",   date: "Apr 18", visibility: "Moderators Only", pinned: false, views: 41 },
  { id: "a4", title: "Writers: new editorial guidelines",        date: "Apr 12", visibility: "Writers Only",    pinned: false, views: 287 },
];

export const mockTopWriters = [
  { rank: 1, name: "Amara Ngono",      department: "Computer Science", posts: 18, claps: 5230, avatar: av("amara") },
  { rank: 2, name: "Kofi Mbarga",      department: "Journalism",       posts: 14, claps: 4120, avatar: av("kofi") },
  { rank: 3, name: "Fatima Nkemdirim", department: "Medicine (FMBS)",  posts: 11, claps: 3120, avatar: av("fatima") },
  { rank: 4, name: "Chanceline Fouda", department: "Law",              posts:  9, claps: 2870, avatar: av("chanceline") },
  { rank: 5, name: "Blaise Eyong",     department: "Business",         posts:  7, claps: 1402, avatar: av("blaise") },
];

export const mockActivityData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  // pseudo-random but stable
  const seed = (i * 9301 + 49297) % 233280;
  const count = 5 + Math.floor((seed / 233280) * 21); // 5..25
  return { date: `${d.getMonth() + 1}/${d.getDate()}`, count };
});
