export type Campus = { id: string; name: string; short: string; members: number; logo: string };
export type Author = { id: string; name: string; username: string; avatar: string; campus: string; department?: string; year?: string };
export type Post = {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  author: Author;
  campus: string;
  readTime: number;
  claps: number;
  comments: number;
  publishedAt: string;
  tags: string[];
  body?: string;
};

export const campuses: Campus[] = [
  { id: "uy1", name: "University of Yaoundé I", short: "UY1", members: 1240, logo: "🎓" },
  { id: "ub", name: "University of Buea", short: "UB", members: 860, logo: "📚" },
  { id: "iubs", name: "IUBS Yaoundé", short: "IUBS", members: 410, logo: "🏛️" },
];

export const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "gist", label: "Gist", emoji: "🔥" },
  { id: "news", label: "News", emoji: "📰" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "academics", label: "Academics", emoji: "🎓" },
  { id: "events", label: "Events", emoji: "🎉" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "opinion", label: "Opinion", emoji: "💬" },
];

const avatars = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=45",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=23",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=8",
];

export const authors: Author[] = [
  { id: "a1", name: "Amara Ngono", username: "amara", avatar: avatars[0], campus: "UY1", department: "Political Science", year: "Year 3" },
  { id: "a2", name: "Kofi Mbarga", username: "kofi", avatar: avatars[1], campus: "UB", department: "Computer Science", year: "Year 2" },
  { id: "a3", name: "Fatima Nkemdirim", username: "fatima", avatar: avatars[2], campus: "UY1", department: "Medicine", year: "Year 4" },
  { id: "a4", name: "Blaise Eyong", username: "blaise", avatar: avatars[3], campus: "IUBS", department: "Business", year: "Year 1" },
  { id: "a5", name: "Chanceline Fouda", username: "chance", avatar: avatars[4], campus: "UY1", department: "Journalism", year: "Year 3" },
  { id: "a6", name: "Ngwa Tabi", username: "ngwa", avatar: avatars[5], campus: "UB", department: "Law", year: "Year 2" },
  { id: "a7", name: "Mireille Tchoumi", username: "mireille", avatar: avatars[6], campus: "IUBS", department: "Economics", year: "Year 3" },
  { id: "a8", name: "Eric Nfor", username: "eric", avatar: avatars[7], campus: "UB", department: "Engineering", year: "Year 4" },
];

const covers = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80",
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  "https://images.unsplash.com/photo-1596496050755-c923e73e42e1?w=1200&q=80",
  "https://images.unsplash.com/photo-1569705460033-cfaa4bf9f822?w=1200&q=80",
  "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=1200&q=80",
];

const longBody = `The buzz around campus has been impossible to ignore this semester. From late-night study marathons in the science block to packed-out football matches at the stadium, students are showing up — and showing out.

## What's actually happening

Across faculties, peer-led study groups have quietly become the most reliable way to prepare for the upcoming finals. Lecturers know it. Administrators know it. And students who don't tap in tend to feel it on results day.

## A new way to share

YouthTrend wants to be the place where these stories live — not stuck in WhatsApp groups that disappear, not lost in noisy timelines, but in a feed built for you and your campus.

> "We finally have somewhere to write the truth about our campus, in our voice."

The platform is intentionally small at launch — three campuses, a handful of categories, and a clean editor. The idea is to grow with the community, one story at a time.

## What's next

Expect bilingual posts, anonymous gist drops, and a creator program that actually pays student writers. The first cohort opens applications next month — keep your eyes on the announcements feed.`;

export const posts: Post[] = [
  {
    id: "p1",
    title: "FMBS Final Year Results: What You Need to Know",
    excerpt: "The long-awaited results are out, and the numbers tell a story about what's working — and what isn't — in Cameroon's medical training pipeline.",
    cover: covers[0],
    category: "Academics",
    author: authors[2],
    campus: "UY1",
    readTime: 6,
    claps: 412,
    comments: 38,
    publishedAt: "2h ago",
    tags: ["finals", "fmbs", "ug-life"],
    body: longBody,
  },
  {
    id: "p2",
    title: "The Best Ndolé Spots Near UY1 Campus",
    excerpt: "A no-nonsense ranking of where to actually eat between lectures — voted on by 200+ students who know the difference between good and great.",
    cover: covers[1],
    category: "Culture",
    author: authors[4],
    campus: "UY1",
    readTime: 4,
    claps: 287,
    comments: 52,
    publishedAt: "5h ago",
    tags: ["food", "cameroon", "ug-life"],
    body: longBody,
  },
  {
    id: "p3",
    title: "Why Cameroonian Students Need to Vote in 2026",
    excerpt: "The youth vote could swing this election. Here's what's actually at stake for students — and why staying home isn't neutral.",
    cover: covers[2],
    category: "Opinion",
    author: authors[0],
    campus: "UY1",
    readTime: 8,
    claps: 524,
    comments: 86,
    publishedAt: "1d ago",
    tags: ["politics", "cameroon", "youth"],
    body: longBody,
  },
  {
    id: "p4",
    title: "UB Football Team Qualifies for Inter-University Finals",
    excerpt: "After a tense penalty shootout, the Mountain Lions punched their ticket to Yaoundé. The locker-room scenes were unreal.",
    cover: covers[3],
    category: "Sports",
    author: authors[5],
    campus: "UB",
    readTime: 3,
    claps: 689,
    comments: 124,
    publishedAt: "1d ago",
    tags: ["football", "ub", "sports"],
    body: longBody,
  },
  {
    id: "p5",
    title: "5 Free Resources Every CS Student at UB Should Know",
    excerpt: "From compiler explorers to the GitHub Student Pack, here are the tools your senior wishes someone had told them about in Year 1.",
    cover: covers[4],
    category: "Academics",
    author: authors[1],
    campus: "UB",
    readTime: 5,
    claps: 318,
    comments: 27,
    publishedAt: "2d ago",
    tags: ["tech", "cs", "resources"],
    body: longBody,
  },
  {
    id: "p6",
    title: "Inside the IUBS Entrepreneurship Week",
    excerpt: "Three days, twelve pitches, one winning idea. We sat down with the team that walked away with the 2M FCFA grand prize.",
    cover: covers[5],
    category: "Events",
    author: authors[3],
    campus: "IUBS",
    readTime: 5,
    claps: 241,
    comments: 19,
    publishedAt: "2d ago",
    tags: ["startups", "iubs", "events"],
    body: longBody,
  },
  {
    id: "p7",
    title: "The Great Wi-Fi Outage of Block C — What Really Happened",
    excerpt: "Two weeks. Zero connectivity. A lot of conspiracy theories. We tracked down the truth — and it's more boring than you think.",
    cover: covers[6],
    category: "Gist",
    author: authors[4],
    campus: "UY1",
    readTime: 4,
    claps: 198,
    comments: 71,
    publishedAt: "3d ago",
    tags: ["gist", "campus-life"],
    body: longBody,
  },
  {
    id: "p8",
    title: "Afrobeats Night at UB: A Recap You'll Wish You Were At",
    excerpt: "From the surprise guest DJ to the moment the lights cut and the crowd kept singing — last Saturday was one for the books.",
    cover: covers[7],
    category: "Events",
    author: authors[7],
    campus: "UB",
    readTime: 4,
    claps: 356,
    comments: 44,
    publishedAt: "4d ago",
    tags: ["music", "events", "ub"],
    body: longBody,
  },
  {
    id: "p9",
    title: "How I Balanced Med School and Starting a Side Hustle",
    excerpt: "Spoiler: I didn't, at first. Then I built a system. Here's exactly what I do every week to keep both alive without burning out.",
    cover: covers[8],
    category: "Opinion",
    author: authors[2],
    campus: "UY1",
    readTime: 7,
    claps: 472,
    comments: 58,
    publishedAt: "5d ago",
    tags: ["productivity", "youth"],
    body: longBody,
  },
  {
    id: "p10",
    title: "Why Bilingual Education Still Isn't Working — And How to Fix It",
    excerpt: "A law student from Buea takes on the policy gaps everyone else is too polite to name out loud.",
    cover: covers[9],
    category: "Opinion",
    author: authors[5],
    campus: "UB",
    readTime: 9,
    claps: 612,
    comments: 142,
    publishedAt: "1w ago",
    tags: ["politics", "education"],
    body: longBody,
  },
];

export const announcements = [
  { id: "an1", title: "Exam timetable for FMBS released — check the portal", time: "2h" },
  { id: "an2", title: "UB matriculation ceremony moved to Saturday", time: "1d" },
];

export const events = [
  { id: "e1", title: "UY1 Tech Career Fair", date: "May 18", venue: "Main Auditorium" },
  { id: "e2", title: "Inter-University Football Finals", date: "May 22", venue: "Yaoundé Stadium" },
];

export const trending = posts.slice(0, 5).map((p, i) => ({ rank: i + 1, title: p.title, claps: p.claps, id: p.id }));

export const tagCloud = ["gist", "sports", "ug-life", "cameroon", "finals", "tech", "politics", "music", "fashion", "startups", "food"];

export const currentUser: Author = {
  id: "me",
  name: "Yannick Mbarga",
  username: "yannick",
  avatar: "https://i.pravatar.cc/150?img=68",
  campus: "UY1",
  department: "Software Engineering",
  year: "Year 3",
};

export const notifications = [
  { id: "n1", group: "Today", text: "Kofi Mbarga clapped for your post 27 times", time: "2h", unread: true, icon: "👏" },
  { id: "n2", group: "Today", text: "New comment on 'UY1 Football Final Results'", time: "4h", unread: true, icon: "💬" },
  { id: "n3", group: "Today", text: "YouthTrend Campus Announcement: Exam timetable released", time: "6h", unread: false, icon: "📢" },
  { id: "n4", group: "This Week", text: "Amara started following you", time: "2d", unread: false, icon: "👤" },
  { id: "n5", group: "This Week", text: "Fatima replied to your comment", time: "3d", unread: false, icon: "↩️" },
];

export const testimonials = [
  { name: "Amara K.", school: "UB", quote: "YouthTrend is where I found out about everything happening on campus before anyone else.", avatar: avatars[0] },
  { name: "Blaise E.", school: "IUBS", quote: "Finally, a place to publish stories that don't disappear in a WhatsApp group.", avatar: avatars[3] },
  { name: "Fatima N.", school: "UY1", quote: "The campus feed is unreal. I read it more than I scroll Twitter now.", avatar: avatars[2] },
];
