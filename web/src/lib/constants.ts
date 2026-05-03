import { 
  Flame, 
  Newspaper, 
  Trophy, 
  GraduationCap, 
  Calendar, 
  Music, 
  MessageCircle,
  Globe,
  Building,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORIES = [
  { name: "Gist", icon: Flame },
  { name: "News", icon: Newspaper },
  { name: "Sports", icon: Trophy },
  { name: "Academics", icon: GraduationCap },
  { name: "Events", icon: Calendar },
  { name: "Culture", icon: Music },
  { name: "Opinion", icon: MessageCircle },
] as const;

export const CAMPUS_ICONS: Record<string, LucideIcon> = {
  UY1: GraduationCap,
  UB: Globe,
  IUBS: Building,
};