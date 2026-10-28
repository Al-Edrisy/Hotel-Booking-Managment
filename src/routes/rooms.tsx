import { useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  BedDouble,
  CheckCircle2,
  Clock,
  DoorOpen,
  Filter,
  Hammer,
  KeyRound,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { OperationalBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { useCurrency } from "@/lib/currency";
import { todayISO } from "@/lib/dates";
import { guestName, indexById, occupiedOn } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";
import type { OperationalStatus, Room, RoomType } from "@/types";

const ROOM_RATES: Record<RoomType, number> = {
  standard: 140,
  deluxe: 195,
  family: 240,
  suite: 330,
};

export const Route = createFileRoute("/rooms")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rooms & Housekeeping — 22 Boutique Hotel" },
      {
        name: "description",
        content: "Room inventory, occupancy and housekeeping management for 22 Boutique Hotel.",
      },
      { property: "og:title", content: "Rooms & Housekeeping — 22 Boutique Hotel" },
      {
        property: "og:description",
        content: "Room inventory, occupancy and housekeeping management for 22 Boutique Hotel.",
      },
    ],
  }),
  component: RoomsPage,
});

export function RoomsPage() {
  const { t } = useI18n();
  const { formatMoney } = useCurrency();
  const { rooms, reservations, guests, saveRoom } = useHotelData();
  const { openNew, openDetail } = useReservationUI();
  const searchParams = useSearch({ from: "/rooms" });

  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const today = todayISO();
  const guestMap = useMemo(() => indexById(guests), [guests]);

  // Map of occupied room id -> active reservation
  const activeOccupancy = useMemo(() => {
    const map = new Map<string, (typeof reservations)[0]>();
    for (const r of reservations) {
      if (r.status !== "cancelled" && r.checkIn <= today && r.checkOut > today) {
        map.set(r.roomId, r);
      }
    }
    return map;
  }, [reservations, today]);

  // KPI calculations
  const totalCount = rooms.length;
  const inServiceCount = rooms.filter((r) => r.operationalStatus === "in_service").length;
  const attentionCount = rooms.filter((r) => r.operationalStatus === "needs_attention").length;
  const outOfOrderCount = rooms.filter((r) => r.operationalStatus === "out_of_order").length;
  const occupiedCount = activeOccupancy.size;

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((r) => {
      if (floorFilter !== "all" && String(r.floor) !== floorFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.operationalStatus !== statusFilter) return false;
      if (q && !r.number.toLowerCase().includes(q) && !r.notes.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [rooms, searchQuery, floorFilter, typeFilter, statusFilter]);

  const handleUpdateStatus = (room: Room, newStatus: OperationalStatus) => {
    saveRoom({ ...room, operationalStatus: newStatus });
    toast.success(`Room ${room.number} updated`, {
      description: `Marked as ${newStatus.replace("_", " ")}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t("nav.rooms")}
        subtitle="Manage room inventory, housekeeping status, and guest assignments."
        actions={
          <Button onClick={() => openNew()} className="gap-2 shadow-xs">
            <Plus className="size-4" />
            <span>New Reservation</span>
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Inventory</span>
              <BedDouble className="size-3.5 text-primary" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight tabular">{totalCount}</span>
              <span className="text-xs text-muted-foreground">Suites & Rooms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>In Service (Ready)</span>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
                {inServiceCount}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {Math.round((inServiceCount / totalCount) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Housekeeping Needed</span>
              <Clock className="size-3.5 text-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
                {attentionCount}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400">Attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Currently Occupied</span>
              <DoorOpen className="size-3.5 text-sky-500" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular">
                {occupiedCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round((occupiedCount / totalCount) * 100)}% Occ.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room number, notes..."
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

          {/* Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="h-9 w-[110px] text-xs">
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Service Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_service">In Service</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
                <SelectItem value="out_of_order">Out of Order</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {filteredRooms.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-semibold text-foreground">No rooms match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try clearing some filter options.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setFloorFilter("all");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            className="mt-4 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filters</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => {
            const activeRes = activeOccupancy.get(room.id);
            const residentGuest = activeRes ? guestMap[activeRes.guestId] : undefined;
            const rate = ROOM_RATES[room.type];

            return (
              <Card
                key={room.id}
                className="border-border/80 transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                          {room.number}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          Fl {room.floor}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">
                        {room.type} Suite · Max {room.capacity} guests
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold tabular text-foreground">
                        {formatMoney(rate)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">per night</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Occupancy & Service Status */}
                  <div className="space-y-2 border-t border-border/60 pt-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Service Status:</span>
                      <OperationalBadge status={room.operationalStatus} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Occupancy:</span>
                      {activeRes ? (
                        <button
                          type="button"
                          onClick={() => openDetail(activeRes.id)}
                          className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">
                            {residentGuest ? guestName(residentGuest) : "In-House"}
                          </span>
                        </button>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                          <span>Vacant</span>
                        </span>
                      )}
                    </div>

                    {room.notes && (
                      <p className="text-[11px] text-muted-foreground italic truncate">
                        {room.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-1.5 border-t border-border/60 pt-2.5">
                    {/* Status quick toggle */}
                    {room.operationalStatus === "in_service" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(room, "needs_attention")}
                        className="h-7 text-[11px] px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        Needs Cleaning
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(room, "in_service")}
                        className="h-7 text-[11px] px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Mark Clean
                      </Button>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingRoom(room)}
                        title="Edit room specs"
                      >
                        <Pencil className="size-3" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openNew({ roomId: room.id, checkIn: today })}
                        className="h-7 text-[11px] px-2.5 gap-1 bg-primary text-primary-foreground"
                      >
                        <KeyRound className="size-3" />
                        <span>Book</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[100px] text-xs font-semibold">Number</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">Type</TableHead>
                <TableHead className="w-[80px] text-xs font-semibold">Floor</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold">Capacity</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">Rate</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold">Housekeeping</TableHead>
                <TableHead className="min-w-[160px] text-xs font-semibold">Current Guest</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => {
                const activeRes = activeOccupancy.get(room.id);
                const residentGuest = activeRes ? guestMap[activeRes.guestId] : undefined;
                return (
                  <TableRow key={room.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-bold">{room.number}</TableCell>
                    <TableCell className="capitalize text-xs">{room.type}</TableCell>
                    <TableCell className="text-xs">Floor {room.floor}</TableCell>
                    <TableCell className="text-xs">{room.capacity} guests</TableCell>
                    <TableCell className="font-mono text-xs tabular font-medium">
                      {formatMoney(ROOM_RATES[room.type])}
                    </TableCell>
                    <TableCell>
                      <OperationalBadge status={room.operationalStatus} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {activeRes ? (
                        <button
                          type="button"
                          onClick={() => openDetail(activeRes.id)}
                          className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {residentGuest ? guestName(residentGuest) : "Occupied"}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setEditingRoom(room)}
                          title="Edit"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openNew({ roomId: room.id, checkIn: today })}
                        >
                          Book
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Room Dialog */}
      {editingRoom && (
        <Dialog open={!!editingRoom} onOpenChange={(o) => !o && setEditingRoom(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Room {editingRoom.number}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveRoom(editingRoom);
                setEditingRoom(null);
                toast.success(`Room ${editingRoom.number} updated`);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="room-num">Room Number</Label>
                  <Input
                    id="room-num"
                    value={editingRoom.number}
                    onChange={(e) => setEditingRoom({ ...editingRoom, number: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="room-floor">Floor</Label>
                  <Input
                    id="room-floor"
                    type="number"
                    min={1}
                    max={10}
                    value={editingRoom.floor}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, floor: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Room Type</Label>
                  <Select
                    value={editingRoom.type}
                    onValueChange={(v: RoomType) => setEditingRoom({ ...editingRoom, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Service Status</Label>
                  <Select
                    value={editingRoom.operationalStatus}
                    onValueChange={(v: OperationalStatus) =>
                      setEditingRoom({ ...editingRoom, operationalStatus: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_service">In Service</SelectItem>
                      <SelectItem value="needs_attention">Needs Attention</SelectItem>
                      <SelectItem value="out_of_order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room-notes">Operational Notes</Label>
                <Textarea
                  id="room-notes"
                  value={editingRoom.notes}
                  onChange={(e) => setEditingRoom({ ...editingRoom, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingRoom(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
