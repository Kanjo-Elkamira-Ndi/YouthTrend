import type { Campus, User, Post, Comment, AppNotification } from "@/types";

export const campuses: Campus[] = [
  { id: "uy1", name: "University of Yaoundé I", short: "UY1", emoji: "🎓", members: 1240 },
  { id: "ub", name: "University of Buea", short: "UB", emoji: "🌄", members: 880 },
  { id: "iubs", name: "IUBS Yaoundé", short: "IUBS", emoji: "🏛️", members: 320 },
];

const av = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

export const users: User[] = [
  { id: "u1", username: "amara.ngono", name: "Amara Ngono", avatar: av("amara"), campus: "UY1", department: "Computer Science", year: "Level 300", bio: "CS student. I write about tech, campus life, and the occasional ndolé review.", followers: 842, following: 134, totalClaps: 5230, joinedAt: "Sep 2024" },
  { id: "u2", username: "kofi.mbarga", name: "Kofi Mbarga", avatar: av("kofi"), campus: "UB", department: "Journalism", year: "Level 400", bio: "Sports junkie. UB Lions till I die.", followers: 1204, following: 88, totalClaps: 8900, joinedAt: "Jan 2024" },
  { id: "u3", username: "fatima.nkemdirim", name: "Fatima Nkemdirim", avatar: av("fatima"), campus: "UY1", department: "Medicine (FMBS)", year: "Level 500", bio: "Future surgeon. Currently surviving anatomy.", followers: 612, following: 210, totalClaps: 3120, joinedAt: "Mar 2024" },
  { id: "u4", username: "blaise.eyong", name: "Blaise Eyong", avatar: av("blaise"), campus: "IUBS", department: "Business", year: "Level 200", bio: "Entrepreneur in training. Buy local.", followers: 318, following: 145, totalClaps: 1402, joinedAt: "Oct 2024" },
  { id: "u5", username: "chanceline.fouda", name: "Chanceline Fouda", avatar: av("chanceline"), campus: "UY1", department: "Law", year: "Level 300", bio: "Politics, justice, and Yaoundé street food.", followers: 987, following: 76, totalClaps: 6700, joinedAt: "Aug 2024" },
  { id: "u6", username: "junior.ndi", name: "Junior Ndi", avatar: av("junior"), campus: "UB", department: "Engineering", year: "Level 400", bio: "Hardware tinkerer. Buea fog appreciator.", followers: 421, following: 90, totalClaps: 2200, joinedAt: "Feb 2025" },
];

const img = (id: number) => `https://picsum.photos/seed/yt${id}/1200/700`;

export const posts: Post[] = [
  {
    id: "p1",
    title: "FMBS Final Year Results: What You Need to Know",
    excerpt: "The Faculty of Medicine just dropped the Level 500 results. Here's a calm breakdown of what passed, what failed, and what's next for the class of 2026.",
    body: longBody("FMBS Final Year Results"),
    cover: img(1),
    category: "Academics",
    tags: ["fmbs", "results", "uy1"],
    author: users[2],
    campus: "UY1",
    publishedAt: "2h ago",
    readMinutes: 6,
    claps: 1240,
    comments: 87,
    featured: true,
  },
  {
    id: "p2",
    title: "The Best Ndolé Spots Near UY1 Campus",
    excerpt: "From Mama Eyenga's roadside stand to that hidden gem behind Bonamoussadi — I ate my way through 12 spots so you don't have to.",
    body: longBody("The Best Ndolé Spots Near UY1 Campus"),
    cover: img(2),
    category: "Culture",
    tags: ["food", "yaounde", "ndole"],
    author: users[0],
    campus: "UY1",
    publishedAt: "5h ago",
    readMinutes: 8,
    claps: 2103,
    comments: 156,
  },
  {
    id: "p3",
    title: "Why Cameroonian Students Need to Vote in 2026",
    excerpt: "Our generation has been called apathetic. I disagree. Here's why the next election matters more than any in the last twenty years.",
    body: longBody("Why Cameroonian Students Need to Vote in 2026"),
    cover: img(3),
    category: "Opinion",
    tags: ["politics", "cameroon", "2026"],
    author: users[4],
    campus: "UY1",
    publishedAt: "1d ago",
    readMinutes: 7,
    claps: 3401,
    comments: 412,
    featured: true,
  },
  {
    id: "p4",
    title: "UB Football Team Qualifies for Inter-University Finals",
    excerpt: "A late header from Tabi sent the Lions through. Inside the locker room, the coach's tactical switch, and what's next in Douala.",
    body: longBody("UB Football Team Qualifies for Inter-University Finals"),
    cover: img(4),
    category: "Sports",
    tags: ["football", "ub", "lions"],
    author: users[1],
    campus: "UB",
    publishedAt: "1d ago",
    readMinutes: 5,
    claps: 1820,
    comments: 203,
  },
  {
    id: "p5",
    title: "5 Free Resources Every CS Student at UB Should Know",
    excerpt: "Forget paid bootcamps. These five free platforms (and one Telegram channel) carried me through Data Structures.",
    body: longBody("5 Free Resources Every CS Student at UB Should Know"),
    cover: img(5),
    category: "Academics",
    tags: ["cs", "resources", "free"],
    author: users[5],
    campus: "UB",
    publishedAt: "2d ago",
    readMinutes: 9,
    claps: 980,
    comments: 64,
  },
  {
    id: "p6",
    title: "Inside the IUBS Entrepreneurship Week — What Actually Worked",
    excerpt: "Three pitches got funded. Two went viral. One founder cried. I was there for all of it.",
    body: longBody("Inside the IUBS Entrepreneurship Week"),
    cover: img(6),
    category: "Events",
    tags: ["iubs", "startup", "pitch"],
    author: users[3],
    campus: "IUBS",
    publishedAt: "2d ago",
    readMinutes: 6,
    claps: 612,
    comments: 41,
  },
  {
    id: "p7",
    title: "Hostel Wahala: My First Week in Cité Verte",
    excerpt: "The lights went off three times. The water came back twice. I made four new friends. Welcome to off-campus life.",
    body: longBody("Hostel Wahala: My First Week in Cité Verte"),
    cover: img(7),
    category: "Gist",
    tags: ["hostel", "campus-life"],
    author: users[0],
    campus: "UY1",
    publishedAt: "3d ago",
    readMinutes: 4,
    claps: 1450,
    comments: 312,
  },
  {
    id: "p8",
    title: "The Bilingual Brain: Code-Switching at Cameroonian Unis",
    excerpt: "Why your lecturer slips between French and English mid-sentence — and why it's actually a superpower.",
    body: longBody("The Bilingual Brain"),
    cover: img(8),
    category: "Culture",
    tags: ["language", "bilingual", "cameroon"],
    author: users[4],
    campus: "UY1",
    publishedAt: "4d ago",
    readMinutes: 6,
    claps: 877,
    comments: 92,
  },
];

function longBody(title: string) {
  return `
**${title}**

Walk past the main gate any morning this week and you can feel it — something has shifted. Students huddle in small groups, phones tilted, voices low. The notice board outside the dean's office has a fresh queue.

This is the kind of story that gets told and retold across campuses, mutated each time it crosses a faculty line. So let's slow down and lay it out plainly, the way I wish someone had laid it out for me when I was in Level 200.

**What actually happened**

The bulletin went up at 6:47 a.m. By 7:15, the whole department group chat was on fire. Three things were clear: the pass rate is up, the moderation panel was different this year, and a handful of contested papers are being re-graded.

> "We knew the cohort was strong, but this is a new ceiling," one lecturer told me, asking not to be named.

**Why it matters**

For students, results day is never just about results. It's about rent next semester. It's about whether your parents in Bafoussam will let you stay in Yaoundé. It's about whether the long nights in the FMBS library actually meant something.

For the faculty, it's a signal — about teaching, about pacing, about the gap between what the syllabus promises and what the final exam demands.

**What to do next**

1. Pick up your transcript in person. Do not trust screenshots floating around WhatsApp.
2. If you're contesting a grade, you have ten working days. Ten. Not eleven.
3. Talk to a senior. Not the loudest senior — the one who actually helped you when you were in Level 100.

There is more to come on this story. I'm following the moderation panel meeting on Friday. If you have a tip, my DMs are open.
`;
}

export const comments: Comment[] = [
  {
    id: "c1",
    author: users[1],
    text: "This is the breakdown I needed. Shared it with my whole class group.",
    time: "1h ago",
    likes: 24,
    replies: [
      { id: "c1r1", author: users[2], text: "Glad it helped! Tell them about the 10-day window — that's the part everyone misses.", time: "45m ago", likes: 8 },
    ],
  },
  { id: "c2", author: users[3], text: "Wait, the moderation panel actually changed? That explains so much.", time: "2h ago", likes: 15 },
  { id: "c3", author: users[4], text: "Solid reporting. More of this please.", time: "3h ago", likes: 41 },
  { id: "c4", author: users[5], text: "Came for the gist, stayed for the actual journalism. 👏", time: "4h ago", likes: 33 },
];

export const notifications: AppNotification[] = [
  { id: "n1", icon: "clap", text: "Kofi Mbarga clapped for your post 27 times", time: "12m ago", read: false, group: "Today" },
  { id: "n2", icon: "comment", text: "New comment on 'UY1 Football Final Results'", time: "1h ago", read: false, group: "Today" },
  { id: "n3", icon: "announcement", text: "YouthTrend Campus Announcement: Exam timetable released", time: "3h ago", read: true, group: "Today" },
  { id: "n4", icon: "follow", text: "Amara Ngono started following you", time: "6h ago", read: true, group: "Today" },
  { id: "n5", icon: "save", text: "Fatima bookmarked your story on FMBS results", time: "2d ago", read: true, group: "This Week" },
  { id: "n6", icon: "clap", text: "Your post 'Best Ndolé Spots' crossed 2,000 claps", time: "3d ago", read: true, group: "This Week" },
];

export const announcements = [
  { id: "a1", title: "Exam timetable for January released", body: "Check the academic affairs office or the official portal.", time: "Today" },
  { id: "a2", title: "UY1 Library extended hours this week", body: "Open until 11 PM Mon–Fri during finals week.", time: "Yesterday" },
];

export const trending = [
  { id: "t1", title: "FMBS Final Year Results: What You Need to Know", claps: 1240 },
  { id: "t2", title: "The Best Ndolé Spots Near UY1 Campus", claps: 2103 },
  { id: "t3", title: "Why Cameroonian Students Need to Vote in 2026", claps: 3401 },
  { id: "t4", title: "UB Football Team Qualifies for Finals", claps: 1820 },
  { id: "t5", title: "Hostel Wahala: My First Week in Cité Verte", claps: 1450 },
];

export const events = [
  { id: "e1", title: "UY1 Career Fair 2026", date: "May 12", venue: "Campus Hall A" },
  { id: "e2", title: "Buea Tech Meetup", date: "May 18", venue: "UB Amphi 700" },
];

export const topics = ["#gist", "#sports", "#ug-life", "#cameroon", "#finals", "#tech", "#politics", "#music", "#fashion"];

export const currentUser: User = users[0];