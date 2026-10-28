import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Crown,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReservationStatusBadge } from "@/components/shared/StatusBadge";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { todayISO } from "@/lib/dates";
import { arrivalsOn, departuresOn, guestName, hotelStats, indexById } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard & Data Analysis — 22 Boutique Hotel" },
      {
        name: "description",
        content: "Daily operations and data analytics intelligence for 22 Boutique Hotel.",
      },
      {
        property: "og:title",
        content: "Dashboard & Data Analysis — 22 Boutique Hotel",
      },
      {
        property: "og:description",
        content: "Daily operations and data analytics intelligence for 22 Boutique Hotel.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, formatDate, formatNumber } = useI18n();
  const { rooms, reservations, guests, activity } = useHotelData();
  const { openDetail } = useReservationUI();
  const [activeTab, setActiveTab] = useState<string>("operations");

  const today = todayISO();
  const s = hotelStats(today, rooms, reservations);
  const g = indexById(guests);
  const r = indexById(rooms);

  const stats = [
    ["dashboard.totalRooms", s.total, "capacity"],
    ["dashboard.available", s.available, "open"],
    ["dashboard.occupied", s.occupied, "in-house"],
    ["dashboard.attention", s.attention, "service"],
    ["dashboard.arrivals", s.arrivals, "today"],
    ["dashboard.departures", s.departures, "today"],
  ] as const;

  const list = (items: typeof reservations, empty: string) =>
    items.length ? (
      items.map((x) => (
        <button
          key={x.id}
          onClick={() => openDetail(x.id)}
          className="flex w-full items-center gap-3 border-b border-border/70 py-2.5 text-left text-sm last:border-0 hover:bg-muted/50 transition-colors"
        >
          <span className="w-10 font-mono font-medium">{r[x.roomId]?.number}</span>
          <span className="flex-1 font-medium">{guestName(g[x.guestId])}</span>
          <ReservationStatusBadge status={x.status} />
        </button>
      ))
    ) : (
      <p className="py-4 text-center text-xs text-muted-foreground">{empty}</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={t("nav.dashboard")}
          subtitle={t("dashboard.subtitle", { date: formatDate(today, "long") })}
        />

        {/* View Switcher Tabs & Home Showcase Link */}
        <div className="flex items-center gap-3 pb-6">
          <Link
            to="/home"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Crown className="size-3.5 text-amber-500" />
            <span>Home & Showcase</span>
          </Link>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-[380px]">
              <TabsTrigger value="analytics" className="gap-2 text-xs">
                <BarChart3 className="size-3.5" />
                <span>Data Analysis & Charts</span>
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-2 text-xs">
                <LayoutDashboard className="size-3.5" />
                <span>Front Desk Ops</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([k, v, sub]) => (
          <Card key={k} className="border-border py-3">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t(k)}</span>
                <span className="text-[10px] capitalize opacity-70">{sub}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight tabular">{formatNumber(v)}</span>
                {k === "dashboard.occupied" && (
                  <Badge variant="outline" className="text-[10px]">
                    {formatNumber(s.occupancyRate, { style: "percent" })}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab 1: Deep Data Analytics & Charts */}
      {activeTab === "analytics" && (
        <section aria-label="Data Analytics and Visualizations">
          <AnalyticsDashboard />
        </section>
      )}

      {/* Tab 2: Front Desk Operations */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <DoorOpen className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">{t("dashboard.arrivals")}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {arrivalsOn(today, reservations).length} Guests
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                {list(arrivalsOn(today, reservations), t("dashboard.noArrivals"))}
                <div className="mt-3 pt-2 border-t border-border/60">
                  <Link
                    to="/reservations"
                    className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
                  >
                    <span>View all reservations</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <LogOut className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    {t("dashboard.departures")}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {departuresOn(today, reservations).length} Checkouts
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                {list(departuresOn(today, reservations), t("dashboard.noDepartures"))}
                <div className="mt-3 pt-2 border-t border-border/60">
                  <Link
                    to="/reservations"
                    className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
                  >
                    <span>View all checkouts</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">{t("dashboard.activity")}</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Recent
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-2 text-sm">
                {activity.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className="w-12 font-mono text-xs text-muted-foreground">
                      {a.at.slice(11)}
                    </span>
                    <span className="text-xs text-foreground">
                      {t(`activity.${a.kind}`, { subject: a.subject })}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
