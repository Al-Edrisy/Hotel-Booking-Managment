import { useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  CalendarRange,
  Crown,
  DoorOpen,
  Filter,
  History,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReservationStatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { diffDays, todayISO } from "@/lib/dates";
import { guestName, indexById } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";
import type { Guest } from "@/types";

export const Route = createFileRoute("/guests")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Guests CRM — 22 Boutique Hotel" },
      {
        name: "description",
        content: "Guest directory and profile history for 22 Boutique Hotel.",
      },
      { property: "og:title", content: "Guests CRM — 22 Boutique Hotel" },
      {
        property: "og:description",
        content: "Guest directory and profile history for 22 Boutique Hotel.",
      },
    ],
  }),
  component: GuestsPage,
});

export function GuestsPage() {
  const { t, formatDate } = useI18n();
  const { formatMoney } = useCurrency();
  const { guests, reservations, rooms, saveGuest } = useHotelData();
  const { openDetail, openNew } = useReservationUI();
  const searchParams = useSearch({ from: "/guests" });

  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [filterVipOnly, setFilterVipOnly] = useState(false);

  // Dialogs
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewHistoryGuest, setViewHistoryGuest] = useState<Guest | null>(null);

  // New Guest Form State
  const [newGuestForm, setNewGuestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    notes: "",
  });

  const today = todayISO();
  const roomMap = useMemo(() => indexById(rooms), [rooms]);

  // Guest Stays Map
  const guestReservationsMap = useMemo(() => {
    const map = new Map<string, typeof reservations>();
    for (const res of reservations) {
      const list = map.get(res.guestId) ?? [];
      list.push(res);
      map.set(res.guestId, list);
    }
    return map;
  }, [reservations]);

  // In-House Guest IDs
  const inHouseGuestIds = useMemo(() => {
    const ids = new Set<string>();
    for (const res of reservations) {
      if (res.status === "checked_in") ids.add(res.guestId);
    }
    return ids;
  }, [reservations]);

  // VIP count
  const vipCount = guests.filter(
    (g) => g.notes?.toLowerCase().includes("vip") || g.notes?.toLowerCase().includes("returning"),
  ).length;

  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return guests.filter((g) => {
      const isVip =
        g.notes?.toLowerCase().includes("vip") || g.notes?.toLowerCase().includes("returning");
      if (filterVipOnly && !isVip) return false;

      if (q) {
        const full = `${g.firstName} ${g.lastName}`.toLowerCase();
        const email = g.email?.toLowerCase() ?? "";
        const phone = g.phone?.toLowerCase() ?? "";
        const nat = g.nationality?.toLowerCase() ?? "";
        const notes = g.notes?.toLowerCase() ?? "";
        if (
          !full.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !nat.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [guests, searchQuery, filterVipOnly]);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestForm.firstName.trim() || !newGuestForm.lastName.trim()) {
      toast.error("First and last names are required.");
      return;
    }
    const saved = saveGuest(newGuestForm);
    toast.success(`Guest ${guestName(saved)} created successfully.`);
    setIsAddOpen(false);
    setNewGuestForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationality: "",
      notes: "",
    });
  };

  const handleUpdateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    saveGuest(editingGuest);
    toast.success(`Guest ${guestName(editingGuest)} updated.`);
    setEditingGuest(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.guests")}
        subtitle="Manage guest profiles, VIP preferences, and complete reservation records."
        actions={
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-xs">
            <UserPlus className="size-4" />
            <span>Add Guest</span>
          </Button>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Guest Directory</span>
              <Users className="size-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight tabular">{guests.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>VIP & High Value</span>
              <Crown className="size-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
              {vipCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Guests In-House</span>
              <DoorOpen className="size-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
              {inHouseGuestIds.size}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active Bookings</span>
              <CalendarRange className="size-3.5 text-sky-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular">
              {reservations.filter((r) => r.status !== "cancelled").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, nationality..."
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

        <div className="flex items-center gap-2">
          <Button
            variant={filterVipOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterVipOnly(!filterVipOnly)}
            className="h-9 text-xs gap-1.5"
          >
            <Crown className="size-3.5 text-amber-500" />
            <span>VIP / Returning Only</span>
          </Button>

          {(searchQuery || filterVipOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterVipOnly(false);
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <RotateCcw className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Guests Directory Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[200px] text-xs font-semibold">Guest Name</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold">Contact Email</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold">Phone</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold">Nationality</TableHead>
                <TableHead className="w-[90px] text-xs font-semibold text-center">Stays</TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">
                  Preferences / Notes
                </TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    <p className="font-medium text-foreground">{t("guests.empty")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try another search term or add a new guest.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddOpen(true)}
                      className="mt-4 gap-1.5 text-xs"
                    >
                      <UserPlus className="size-3.5" />
                      <span>Add New Guest</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => {
                  const initials = `${guest.firstName[0] ?? ""}${guest.lastName[0] ?? ""}`;
                  const stays = guestReservationsMap.get(guest.id) ?? [];
                  const isInHouse = inHouseGuestIds.has(guest.id);
                  const isVip =
                    guest.notes?.toLowerCase().includes("vip") ||
                    guest.notes?.toLowerCase().includes("returning");

                  return (
                    <TableRow key={guest.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 ring-1 ring-border">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-foreground">
                                {guestName(guest)}
                              </span>
                              {isVip && (
                                <Crown
                                  className="size-3 text-amber-500 shrink-0"
                                  title="VIP Guest"
                                />
                              )}
                              {isInHouse && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] py-0 px-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                >
                                  In-House
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {guest.email || "—"}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {guest.phone || "—"}
                      </TableCell>

                      <TableCell>
                        {guest.nationality ? (
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            {guest.nationality}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => setViewHistoryGuest(guest)}
                          className="font-mono text-xs font-semibold tabular text-primary hover:underline"
                          title="View stay history"
                        >
                          {stays.length}
                        </button>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {guest.notes || "No special requests"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setViewHistoryGuest(guest)}
                            title="View reservation history"
                          >
                            <History className="size-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingGuest(guest)}
                            title="Edit guest profile"
                          >
                            <Pencil className="size-3" />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => openNew({ guestId: guest.id, checkIn: today })}
                            className="h-7 text-[11px] px-2 gap-1 bg-primary text-primary-foreground"
                            title="Book stay for this guest"
                          >
                            <KeyRound className="size-3" />
                            <span>Book</span>
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

        <div className="flex items-center justify-between border-t border-border/80 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredGuests.length}</strong> of{" "}
            {guests.length} guest records
          </span>
          <span className="font-mono text-[11px]">22 Boutique Hotel Concierge</span>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Guest Profile</DialogTitle>
            <DialogDescription>
              Record guest contact information and personal hospitality preferences.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGuest} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-fn">First Name *</Label>
                <Input
                  id="add-fn"
                  required
                  value={newGuestForm.firstName}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, firstName: e.target.value })}
                  placeholder="Eleanor"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-ln">Last Name *</Label>
                <Input
                  id="add-ln"
                  required
                  value={newGuestForm.lastName}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, lastName: e.target.value })}
                  placeholder="Vance"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-email">Email Address</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={newGuestForm.email}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, email: e.target.value })}
                  placeholder="e.vance@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-phone">Phone Number</Label>
                <Input
                  id="add-phone"
                  value={newGuestForm.phone}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-nat">Nationality (Country or 2-letter Code)</Label>
              <Input
                id="add-nat"
                value={newGuestForm.nationality}
                onChange={(e) => setNewGuestForm({ ...newGuestForm, nationality: e.target.value })}
                placeholder="FR, GB, US, TR..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-notes">Hospitality & VIP Preferences</Label>
              <Textarea
                id="add-notes"
                rows={2}
                value={newGuestForm.notes}
                onChange={(e) => setNewGuestForm({ ...newGuestForm, notes: e.target.value })}
                placeholder="VIP · Prefers quiet high floor, sparkling water on arrival"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Guest Profile</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Guest Modal */}
      {editingGuest && (
        <Dialog open={!!editingGuest} onOpenChange={(o) => !o && setEditingGuest(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile: {guestName(editingGuest)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={editingGuest.firstName}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={editingGuest.lastName}
                    onChange={(e) => setEditingGuest({ ...editingGuest, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingGuest.email}
                    onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={editingGuest.phone}
                    onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Input
                  value={editingGuest.nationality}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, nationality: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Hospitality Preferences & Notes</Label>
                <Textarea
                  rows={2}
                  value={editingGuest.notes}
                  onChange={(e) => setEditingGuest({ ...editingGuest, notes: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingGuest(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Guest Stay History Sheet */}
      {viewHistoryGuest && (
        <Sheet open={!!viewHistoryGuest} onOpenChange={(o) => !o && setViewHistoryGuest(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-serif text-lg">
                Stay History: {guestName(viewHistoryGuest)}
              </SheetTitle>
              <SheetDescription>
                {viewHistoryGuest.email} · {viewHistoryGuest.phone || "No phone"}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {viewHistoryGuest.notes && (
                <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
                  <div className="font-semibold text-foreground mb-0.5">Preferences & Notes</div>
                  <div className="text-muted-foreground">{viewHistoryGuest.notes}</div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reservation Records
                </h4>

                {(guestReservationsMap.get(viewHistoryGuest.id) ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No reservations recorded for this guest.
                  </p>
                ) : (
                  (guestReservationsMap.get(viewHistoryGuest.id) ?? []).map((res) => {
                    const room = roomMap[res.roomId];
                    const nights = diffDays(res.checkOut, res.checkIn);
                    return (
                      <div
                        key={res.id}
                        onClick={() => {
                          setViewHistoryGuest(null);
                          openDetail(res.id);
                        }}
                        className="rounded-lg border border-border p-3 text-xs transition-colors hover:bg-muted/50 cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground">
                            {res.reference}
                          </span>
                          <ReservationStatusBadge status={res.status} />
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>
                            Room {room?.number ?? "—"} ({room?.type ?? "—"})
                          </span>
                          <span>
                            {formatDate(res.checkIn, "short")} → {formatDate(res.checkOut, "short")}{" "}
                            ({nights}n)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    const gId = viewHistoryGuest.id;
                    setViewHistoryGuest(null);
                    openNew({ guestId: gId, checkIn: today });
                  }}
                  className="w-full gap-2"
                >
                  <KeyRound className="size-4" />
                  <span>Book New Stay for {viewHistoryGuest.firstName}</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
