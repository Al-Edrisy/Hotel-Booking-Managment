import {
  BedDouble,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { TranslationKey } from "@/i18n";

export const mainNav = [
  { to: "/home", key: "nav.home", icon: LayoutDashboard },
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/reservations", key: "nav.reservations", icon: CalendarRange },
  { to: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { to: "/rooms", key: "nav.rooms", icon: BedDouble },
  { to: "/guests", key: "nav.guests", icon: Users },
] as const satisfies readonly { to: string; key: TranslationKey; icon: unknown }[];

export const adminNav = [
  { to: "/staff", key: "nav.staff", icon: ShieldCheck },
  { to: "/settings", key: "nav.settings", icon: Settings },
] as const satisfies readonly { to: string; key: TranslationKey; icon: unknown }[];

export function navKeyForPath(path: string): TranslationKey {
  const item = [...mainNav, ...adminNav].find((n) =>
    n.to === "/" ? path === "/" : path.startsWith(n.to),
  );
  return item?.key ?? "nav.dashboard";
}
