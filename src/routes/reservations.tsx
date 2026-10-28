import { useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  DoorOpen,
  Filter,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReservationStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { useCurrency } from "@/lib/currency";
import { diffDays, todayISO } from "@/lib/dates";
import { guestName, indexById } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";
import type { ReservationStatus, RoomType } from "@/types";

const ROOM_RATES: Record<RoomType, number> = {
  standard: 140,
  deluxe: 195,
  family: 240,
  suite: 330,
};

export const Route = createFileRoute("/reservations")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reservations — 22 Boutique Hotel" },
      { name: "description", content: "Reservations management for 22 Boutique Hotel operations." },
      { property: "og:title", content: "Reservations — 22 Boutique Hotel" },
      {
        property: "og:description",
        content: "Reservations management for 22 Boutique Hotel operations.",
      },
    ],
  }),
  component: ReservationsPage,
});

export function ReservationsPage() {
  const { t, formatDate } = useI18n();
  const { formatCurrency } = useCurrency();
  const { reservations, rooms, guests, setReservationStatus } = useHotelData();
  const { openNew, openDetail, openEdit } = useReservationUI();
  const searchParams = useSearch({ from: "/reservations" });

  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");

  const guestMap = useMemo(() => indexById(guests), [guests]);
  const roomMap = useMemo(() => indexById(rooms), [rooms]);
  const today = todayISO();

  // Metrics
  const activeCount = reservations.filter((r) => r.status !== "cancelled").length;
  const inHouseCount = reservations.filter((r) => r.status === "checked_in").length;
  const arrivalsToday = reservations.filter(
    (r) => r.checkIn === today && r.status !== "cancelled",
  ).length;
  const departuresToday = reservations.filter(
    (r) => r.checkOut === today && r.status !== "cancelled",
  ).length;

  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reservations.filter((r) => {
      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // Room type filter
      const room = roomMap[r.roomId];
      if (roomTypeFilter !== "all" && room?.type !== roomTypeFilter) return false;

      // Search query filter
      if (q) {
        const guest = guestMap[r.guestId];
        const gName = guest ? guestName(guest).toLowerCase() : "";
        const email = guest?.email?.toLowerCase() ?? "";
        const phone = guest?.phone?.toLowerCase() ?? "";
        const ref = r.reference.toLowerCase();
        const roomNum = room?.number.toLowerCase() ?? "";

        if (
          !ref.includes(q) &&
          !gName.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !roomNum.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, searchQuery, statusFilter, roomTypeFilter, guestMap, roomMap]);

  const handleQuickStatus = (id: string, ref: string, nextStatus: ReservationStatus) => {
    setReservationStatus(id, nextStatus);
    toast.success(t("res.statusChanged", { ref, status: t(`status.${nextStatus}`) }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Button */}
      <PageHeader
        title={t("nav.reservations")}
        subtitle={t("res.subtitle")}
        actions={
          <Button onClick={() => openNew()} className="gap-2 shadow-xs">
            <Plus className="size-4" />
            <span>{t("res.new")}</span>
          </Button>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active Bookings</span>
              <CalendarRange className="size-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight tabular">{activeCount}</div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>In-House Guests</span>
              <DoorOpen className="size-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
              {inHouseCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Arrivals Today</span>
              <LogIn className="size-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
              {arrivalsToday}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Departures Today</span>
              <LogOut className="size-3.5 text-sky-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular">
              {departuresToday}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, guest name, phone, room..."
              className="h-9 pl-9 pr-8 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Room Type Filter */}
          <div className="flex items-center gap-2">
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== "all" || roomTypeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setRoomTypeFilter("all");
                }}
                className="h-9 text-xs text-muted-foreground hover:text-foreground px-2.5"
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>
        </div>

        {/* Status Category Tabs */}
        <div className="border-t border-border/60 pt-2.5 overflow-x-auto">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="all" className="text-xs px-3">
                All ({reservations.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs px-3">
                Confirmed ({reservations.filter((r) => r.status === "confirmed").length})
              </TabsTrigger>
              <TabsTrigger value="checked_in" className="text-xs px-3">
                In-House ({reservations.filter((r) => r.status === "checked_in").length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs px-3">
                Pending ({reservations.filter((r) => r.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="checked_out" className="text-xs px-3">
                Checked Out ({reservations.filter((r) => r.status === "checked_out").length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs px-3">
                Cancelled ({reservations.filter((r) => r.status === "cancelled").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px] text-xs font-semibold">
                  {t("res.reference")}
                </TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">
                  {t("res.guest")}
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">{t("res.room")}</TableHead>
                <TableHead className="w-[200px] text-xs font-semibold">Stay Dates</TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-center">Nights</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-right">
                  Est. Total
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-center">
                  {t("res.status")}
                </TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    <p className="font-medium text-foreground">{t("res.empty")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search criteria or create a new booking.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openNew()}
                      className="mt-4 gap-1.5 text-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>{t("res.new")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((res) => {
                  const guest = guestMap[res.guestId];
                  const room = roomMap[res.roomId];
                  const nights = diffDays(res.checkOut, res.checkIn);
                  const rate = room ? ROOM_RATES[room.type] : 140;
                  const total = rate * Math.max(nights, 1);

                  return (
                    <TableRow
                      key={res.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => openDetail(res.id)}
                    >
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {res.reference}
                      </TableCell>

                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-foreground">
                            {guest ? guestName(guest) : "—"}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {guest?.email ?? guest?.phone ?? "No contact details"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {room?.number ?? "—"}
                          </span>
                          <span className="text-[11px] text-muted-foreground capitalize">
                            ({room?.type ?? "—"})
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs tabular whitespace-nowrap">
                        <span className="font-medium text-foreground">
                          {formatDate(res.checkIn, "short")}
                        </span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="text-muted-foreground">
                          {formatDate(res.checkOut, "short")}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs tabular text-muted-foreground">
                        {nights}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs font-semibold tabular text-foreground">
                        {formatCurrency(total, { currency: res.currency })}
                      </TableCell>

                      <TableCell className="text-center">
                        <ReservationStatusBadge status={res.status} />
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {res.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              onClick={() => handleQuickStatus(res.id, res.reference, "checked_in")}
                              title="Check in guest"
                            >
                              <LogIn className="size-3" />
                              <span className="hidden xl:inline">Check In</span>
                            </Button>
                          )}

                          {res.status === "checked_in" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2 gap-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                              onClick={() =>
                                handleQuickStatus(res.id, res.reference, "checked_out")
                              }
                              title="Check out guest"
                            >
                              <LogOut className="size-3" />
                              <span className="hidden xl:inline">Check Out</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(res.id)}
                            title="Edit reservation"
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer summary bar */}
        <div className="flex items-center justify-between border-t border-border/80 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredReservations.length}</strong> of{" "}
            {reservations.length} total bookings
          </span>
          <span className="font-mono text-[11px]">22 Boutique Hotel Front Desk</span>
        </div>
      </div>
    </div>
  );
}
