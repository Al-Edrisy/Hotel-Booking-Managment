import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BedDouble,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Crown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useHotelData } from "@/mock/store";
import { LuxuryHotelCrest } from "@/components/brand/LuxuryHotelCrest";
import { AccountDialog } from "./AccountDialog";

export function HotelMark({ size = 36 }: { size?: number }) {
  const { settings } = useHotelData();
  if (settings.logoDataUrl)
    return (
      <img
        src={settings.logoDataUrl}
        alt={settings.hotelName}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-md object-cover"
      />
    );
  return <LuxuryHotelCrest size={size} />;
}

export function AppSidebar() {
  const { t } = useI18n();
  const { settings, reservations, rooms, guests, staff, roles } = useHotelData();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [accountOpen, setAccountOpen] = useState(false);

  const me = staff[0] ?? { name: "Celine Laurent", roleId: "admin" };
  const myRole = roles.find((r) => r.id === me.roleId);

  const initials = me.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  // Live operational badges
  const activeReservationsCount = reservations.filter((r) => r.status !== "cancelled").length;
  const availableRoomsCount = rooms.filter((r) => r.operationalStatus === "in_service").length;
  const vipCount =
    guests.filter(
      (g) => g.notes?.toLowerCase().includes("vip") || g.notes?.toLowerCase().includes("returning"),
    ).length || 3;

  const operationItems = [
    {
      to: "/home",
      label: t("nav.home"),
      icon: Crown,
      badge: "Showcase",
      badgeVariant: "outline" as const,
    },
    {
      to: "/",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      badge: "Live",
      badgeVariant: "secondary" as const,
    },
    {
      to: "/reservations",
      label: t("nav.reservations"),
      icon: CalendarRange,
      badge: `${activeReservationsCount}`,
      badgeVariant: "secondary" as const,
    },
    {
      to: "/calendar",
      label: t("nav.calendar"),
      icon: CalendarDays,
      badge: "Rack",
      badgeVariant: "outline" as const,
    },
    {
      to: "/rooms",
      label: t("nav.rooms"),
      icon: BedDouble,
      badge: `${availableRoomsCount}/${rooms.length}`,
      badgeVariant: "secondary" as const,
    },
    {
      to: "/guests",
      label: t("nav.guests"),
      icon: Users,
      badge: `${vipCount} VIP`,
      badgeVariant: "outline" as const,
    },
  ];

  const adminItems = [
    {
      to: "/staff",
      label: t("nav.staff"),
      icon: ShieldCheck,
      badge: `${staff.length}`,
      badgeVariant: "secondary" as const,
    },
    {
      to: "/settings",
      label: t("nav.settings"),
      icon: Settings,
      badge: undefined,
      badgeVariant: undefined,
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Luxury Hotel Header */}
        <SidebarHeader className="border-b border-sidebar-border px-3 py-2.5">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <HotelMark size={38} />
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-serif text-sm font-bold tracking-tight text-foreground">
                  {settings.hotelName}
                </span>
                <Crown className="size-3 text-amber-500 shrink-0" />
              </div>
              <div className="truncate text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                Boutique Hospitality
              </div>
            </div>
          </div>
        </SidebarHeader>

        {/* Organized Navigation Sections */}
        <SidebarContent className="px-1 py-2">
          {/* Section 1: Front Desk Operations */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 px-2.5">
              Front Desk Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {operationItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to)}
                      tooltip={item.label}
                      className="gap-2.5 px-2.5 py-2 font-medium"
                    >
                      <Link to={item.to} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate text-xs">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant}
                            className="ml-auto text-[9px] py-0 px-1 font-mono font-medium group-data-[collapsible=icon]:hidden"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Section 2: Management & Administration */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 px-2.5">
              Management & Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to)}
                      tooltip={item.label}
                      className="gap-2.5 px-2.5 py-2 font-medium"
                    >
                      <Link to={item.to} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate text-xs">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant}
                            className="ml-auto text-[9px] py-0 px-1 font-mono group-data-[collapsible=icon]:hidden"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Clean Luxury Footer with Operator Card */}
        <SidebarFooter className="border-t border-sidebar-border/70 p-2.5 space-y-2">
          {/* Operator Account Card */}
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border/80 bg-muted/40 p-2 text-left transition-colors hover:bg-muted group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center"
            title="Open Account & Profile"
            aria-label="Operator Account Settings"
          >
            <Avatar className="size-7.5 ring-1 ring-primary/30">
              <AvatarFallback className="bg-primary/10 font-semibold text-xs text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <div className="truncate text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{me.name}</span>
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {myRole?.name ?? "Administrator"}
              </div>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground/60 group-data-[collapsible=icon]:hidden shrink-0" />
          </button>

          <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
            <span>22 Boutique Hotel</span>
            <span className="font-mono">v2.2 · Active</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Account Dialog */}
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
