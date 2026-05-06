import { posts, users, campuses } from "./index";

export const mockSearchResults = {
  posts: posts.slice(0, 8),
  writers: users.slice(0, 6),
  campuses: campuses.slice(0, 2),
};

export const mockRecentSearches = [
  "UY1 football",
  "exam tips",
  "ndolé spots",
  "campus election",
  "tech events",
];

export const mockTrendingSearches = [
  "Finals recap",
  "Campus gist",
  "Internship tips",
  "Study spots",
  "FMBS results",
];

export type MockNotif = {
  id: string;
  type: "clap" | "comment" | "follow" | "announcement" | "moderation" | "system" | "pin";
  actorName: string;
  actorAvatar: string;
  message: string;
  timestamp: string;
  group: "Today" | "Yesterday" | "This Week" | "Earlier";
  read: boolean;
  href?: string;
  campusBadge?: string;
};

const av = (s: string) => `https://i.pravatar.cc/150?u=${s}`;

export const mockNotifications: MockNotif[] = [
  { id: "n1", type: "clap", actorName: "Kofi Mbarga", actorAvatar: av("kofi"), message: "clapped for your post 47 times", timestamp: "12m ago", group: "Today", read: false, href: "/post/p1", campusBadge: "UB" },
  { id: "n2", type: "comment", actorName: "Chanceline Fouda", actorAvatar: av("chanceline"), message: "commented on your post: Final Year Survival Guide", timestamp: "1h ago", group: "Today", read: false, href: "/post/p1", campusBadge: "UY1" },
  { id: "n3", type: "clap", actorName: "Amara Ngono", actorAvatar: av("amara"), message: "clapped for your post 12 times", timestamp: "2h ago", group: "Today", read: false, href: "/post/p2" },
  { id: "n4", type: "follow", actorName: "Blaise Eyong", actorAvatar: av("blaise"), message: "started following you", timestamp: "3h ago", group: "Today", read: false, href: "/profile/blaise.eyong", campusBadge: "IUBS" },
  { id: "n5", type: "announcement", actorName: "UY1 Campus", actorAvatar: av("uy1"), message: "New campus announcement: Exam timetable released — Check it out", timestamp: "5h ago", group: "Today", read: false, href: "/feed", campusBadge: "UY1" },
  { id: "n6", type: "pin", actorName: "Campus Admin", actorAvatar: av("admin"), message: "pinned your post to the campus feed", timestamp: "8h ago", group: "Today", read: false, href: "/post/p2" },

  { id: "n7", type: "comment", actorName: "Junior Ndi", actorAvatar: av("junior"), message: "replied to your comment", timestamp: "Yesterday, 18:20", group: "Yesterday", read: false, href: "/post/p4" },
  { id: "n8", type: "clap", actorName: "Fatima Nkemdirim", actorAvatar: av("fatima"), message: "clapped for your post 5 times", timestamp: "Yesterday, 11:02", group: "Yesterday", read: false, href: "/post/p3" },
  { id: "n9", type: "follow", actorName: "Junior Ndi", actorAvatar: av("junior2"), message: "started following you", timestamp: "Yesterday", group: "Yesterday", read: true, href: "/profile/junior.ndi" },
  { id: "n10", type: "comment", actorName: "Kofi Mbarga", actorAvatar: av("kofi"), message: "commented: 'Great insight! 👏'", timestamp: "Yesterday", group: "Yesterday", read: true, href: "/post/p4" },

  { id: "n11", type: "moderation", actorName: "Moderation Team", actorAvatar: av("mod"), message: "Your post 'Hostel Wahala' was reviewed and approved", timestamp: "2d ago", group: "This Week", read: true, href: "/post/p7" },
  { id: "n12", type: "moderation", actorName: "Moderation Team", actorAvatar: av("mod"), message: "Your comment was hidden after review", timestamp: "3d ago", group: "This Week", read: true },
  { id: "n13", type: "announcement", actorName: "UB Campus", actorAvatar: av("ub"), message: "New campus announcement: Library extended hours", timestamp: "3d ago", group: "This Week", read: true, campusBadge: "UB" },
  { id: "n14", type: "clap", actorName: "Multiple readers", actorAvatar: av("group"), message: "Your post crossed 2,000 claps! 🎉", timestamp: "4d ago", group: "This Week", read: true, href: "/post/p2" },
  { id: "n15", type: "system", actorName: "YouthTrend", actorAvatar: av("yt"), message: "Your writer upgrade application was approved", timestamp: "5d ago", group: "This Week", read: true, href: "/profile/me" },

  { id: "n16", type: "system", actorName: "YouthTrend", actorAvatar: av("yt"), message: "Welcome to YouthTrend! Complete your profile to get started.", timestamp: "2 weeks ago", group: "Earlier", read: true },
  { id: "n17", type: "follow", actorName: "Chanceline Fouda", actorAvatar: av("chanceline"), message: "started following you", timestamp: "2 weeks ago", group: "Earlier", read: true },
  { id: "n18", type: "comment", actorName: "Amara Ngono", actorAvatar: av("amara"), message: "commented on your post", timestamp: "3 weeks ago", group: "Earlier", read: true },
  { id: "n19", type: "clap", actorName: "Fatima Nkemdirim", actorAvatar: av("fatima"), message: "clapped for your post 3 times", timestamp: "3 weeks ago", group: "Earlier", read: true },
  { id: "n20", type: "announcement", actorName: "IUBS Campus", actorAvatar: av("iubs"), message: "Entrepreneurship Week starts next Monday", timestamp: "1 month ago", group: "Earlier", read: true, campusBadge: "IUBS" },
];
