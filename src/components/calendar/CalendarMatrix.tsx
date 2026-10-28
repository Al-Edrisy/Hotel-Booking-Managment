import { useState, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  subDays,
  isToday,
  isSameDay,
  startOfToday,
  startOfDay,
  parseISO,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotelData } from "@/mock/store";
import { reservationTone, reservationDot } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { guestName, indexById } from "@/lib/selectors";
import type { RoomType, ReservationStatus } from "@/types";

export function CalendarMatrix() {
  const { rooms, reservations, guests } = useHotelData();
  const { openDetail, openNew } = useReservationUI();
  const [filterRoomType, setFilterRoomType] = useState<RoomType | "all">("all");
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "in_service" | "needs_attention">("all");

  const [startDate, setStartDate] = useState<Date>(() => startOfToday());

  const guestMap = useMemo(() => indexById(guests), [guests]);

  // Show 21 days at a time for optimal readable scannability
  const daysCount = 21;
  const days = useMemo(() => {
    return Array.from({ length: daysCount }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  const handlePrevDays = () => setStartDate((d) => subDays(d, 7));
  const handleNextDays = () => setStartDate((d) => addDays(d, 7));
  const handleResetToday = () => setStartDate(startOfToday());

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filterRoomType !== "all" && room.type !== filterRoomType) return false;
      if (filterFloor !== "all" && String(room.floor) !== filterFloor) return false;
      if (filterStatus !== "all" && room.operationalStatus !== filterStatus) return false;
      return true;
    });
  }, [rooms, filterRoomType, filterFloor, filterStatus]);

  const legends: { status: ReservationStatus; label: string; color: string }[] = [
    {
      status: "confirmed",
      label: "Confirmed",
      color: "bg-confirmed-soft text-confirmed border-confirmed/30",
    },
    {
      status: "checked_in",
      label: "In-House",
      color: "bg-inhouse-soft text-inhouse border-inhouse/30",
    },
    {
      status: "pending",
      label: "Pending",
      color: "bg-pending-soft text-pending border-pending/30",
    },
    {
      status: "checked_out",
      label: "Departed",
      color: "bg-departed-soft text-departed border-departed/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Navigation & Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Range Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handlePrevDays}
              title="Previous 7 days"
              aria-label="Previous 7 days"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToday}
              className="h-8 text-xs font-medium gap-1 px-2.5"
            >
              <RotateCcw className="size-3" />
              <span>Today</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleNextDays}
              title="Next 7 days"
              aria-label="Next 7 days"
            >
              <ChevronRight className="size-4" />
            </Button>

            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-semibold text-foreground tabular">
              {format(days[0], "MMM d")} – {format(days[days.length - 1], "MMM d, yyyy")}
            </span>
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterRoomType}
              onValueChange={(v: RoomType | "all") => setFilterRoomType(v)}
            >
              <SelectTrigger className="h-8 w-[130px] sm:w-[150px] text-xs">
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

            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="h-8 w-[100px] sm:w-[120px] text-xs">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
                <SelectItem value="4">Floor 4</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v: "all" | "in_service" | "needs_attention") => setFilterStatus(v)}
            >
              <SelectTrigger className="h-8 w-[125px] sm:w-[145px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_service">In Service</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-foreground">Status Legend:</span>
            {legends.map((l) => (
              <div key={l.status} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", reservationDot[l.status])} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            Click empty slot to book · Click booking bar to view details
          </span>
        </div>
      </div>

      {/* Calendar Tape Chart Matrix */}
      <div className="relative overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <div
          className="grid min-w-[900px]"
          style={{
            gridTemplateColumns: `160px repeat(${daysCount}, minmax(42px, 1fr))`,
          }}
        >
          {/* Corner cell (sticky both X and Y) */}
          <div className="sticky left-0 top-0 z-30 flex items-center justify-between border-b border-r border-border bg-muted/90 p-2.5 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Room
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {filteredRooms.length}
            </span>
          </div>

          {/* Date Header Cells (sticky Y) */}
          {days.map((day) => {
            const todayCol = isToday(day);
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "sticky top-0 z-20 flex flex-col items-center justify-center border-b border-r border-border p-1.5 text-center transition-colors backdrop-blur-sm",
                  todayCol
                    ? "bg-primary/10 text-primary font-bold"
                    : weekend
                      ? "bg-muted/70 text-foreground/80"
                      : "bg-muted/40 text-foreground",
                )}
              >
                <span className="text-[10px] uppercase font-mono tracking-tight opacity-75">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums mt-0.5",
                    todayCol &&
                      "rounded-full bg-primary text-primary-foreground size-5 flex items-center justify-center",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            );
          })}

          {/* Room Rows */}
          {filteredRooms.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No rooms match the selected filters.
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="contents group">
                {/* Sticky Left Room Info Column */}
                <div className="sticky left-0 z-10 flex items-center justify-between border-b border-r border-border bg-card p-2.5 transition-colors group-hover:bg-muted/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {room.number}
                      </span>
                      {room.operationalStatus === "needs_attention" && (
                        <span
                          className="size-1.5 rounded-full bg-amber-500"
                          title="Needs Attention"
                        />
                      )}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground capitalize">
                      {room.type} · Fl {room.floor}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground"
                    title={`Create booking for Room ${room.number}`}
                    onClick={() =>
                      openNew({
                        roomId: room.id,
                        checkIn: format(startDate, "yyyy-MM-dd"),
                      })
                    }
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>

                {/* Day Cells for this room */}
                {days.map((day) => {
                  const isoDate = format(day, "yyyy-MM-dd");
                  const todayCol = isToday(day);

                  // Find reservation occupying this room on this night [checkIn, checkOut)
                  const reservation = reservations.find(
                    (r) =>
                      r.roomId === room.id &&
                      r.status !== "cancelled" &&
                      r.checkIn <= isoDate &&
                      r.checkOut > isoDate,
                  );

                  const guest = reservation ? guestMap[reservation.guestId] : undefined;
                  const isCheckInDay = reservation?.checkIn === isoDate;
                  const isCheckOutNext =
                    reservation && format(addDays(day, 1), "yyyy-MM-dd") === reservation.checkOut;

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "relative border-b border-r border-border p-1 min-h-[46px] cursor-pointer transition-colors flex items-center justify-center",
                        todayCol && "bg-primary/[0.03]",
                        !reservation && "hover:bg-accent/40",
                      )}
                      onClick={() => {
                        if (reservation) {
                          openDetail(reservation.id);
                        } else {
                          openNew({ roomId: room.id, checkIn: isoDate });
                        }
                      }}
                      title={
                        reservation
                          ? `${reservation.reference} · ${guest ? guestName(guest) : "Guest"} (${reservation.status})`
                          : `Room ${room.number} available on ${isoDate}. Click to book.`
                      }
                    >
                      {reservation ? (
                        <div
                          className={cn(
                            "w-full h-8 flex items-center px-1.5 text-[11px] font-medium transition-all shadow-2xs select-none overflow-hidden",
                            reservationTone[reservation.status],
                            isCheckInDay && "rounded-l-md border-l-2",
                            isCheckOutNext && "rounded-r-md border-r-2",
                            !isCheckInDay && !isCheckOutNext && "rounded-none",
                          )}
                        >
                          {isCheckInDay ? (
                            <span className="truncate font-sans font-semibold text-[10px] leading-tight">
                              {guest ? guestName(guest).split(" ")[0] : reservation.reference}
                            </span>
                          ) : (
                            <span className="size-1 rounded-full bg-current opacity-60 mx-auto" />
                          )}
                        </div>
                      ) : (
                        <div className="size-full opacity-0 hover:opacity-100 flex items-center justify-center text-muted-foreground/50">
                          <Plus className="size-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
