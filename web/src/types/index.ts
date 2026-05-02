export type Campus = {
  id: string;
  name: string;
  short: string;
  emoji: string;
  members: number;
};

export type User = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  campus: string; // campus short
  department?: string;
  year?: string;
  bio?: string;
  followers?: number;
  following?: number;
  totalClaps?: number;
  joinedAt?: string;
};

export type Category =
  | "Gist"
  | "News"
  | "Sports"
  | "Academics"
  | "Events"
  | "Culture"
  | "Opinion";

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  body?: string;
  cover: string;
  category: Category;
  tags: string[];
  author: User;
  campus: string;
  publishedAt: string;
  readMinutes: number;
  claps: number;
  comments: number;
  featured?: boolean;
};

export type Comment = {
  id: string;
  author: User;
  text: string;
  time: string;
  likes: number;
  replies?: Comment[];
};

export type AppNotification = {
  id: string;
  icon: string;
  text: string;
  time: string;
  read: boolean;
  group: "Today" | "This Week";
};
