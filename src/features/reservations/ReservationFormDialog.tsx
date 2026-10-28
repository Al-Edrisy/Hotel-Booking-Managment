import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/PageHeader";
import { DatePicker } from "@/components/ui/date-picker";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/i18n";
import { addDaysISO, diffDays, todayISO } from "@/lib/dates";
import {
  isRoomAvailable,
  validateReservation,
  type ReservationDraft,
  type ReservationErrors,
} from "@/lib/reservations";
import { guestName } from "@/lib/selectors";
import { isValidEmail } from "@/lib/validation";
import { useHotelData } from "@/mock/store";
import type { ReservationStatus, RoomType } from "@/types";

const ROOM_RATES: Record<RoomType, number> = {
  standard: 140,
  deluxe: 195,
  family: 240,
  suite: 330,
};

const STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
];

export interface ReservationPrefill {
  roomId?: string;
  checkIn?: string;
  guestId?: string;
}

function emptyDraft(prefill?: ReservationPrefill): ReservationDraft {
  const checkIn = prefill?.checkIn ?? "";
  return {
    guestId: prefill?.guestId ?? "",
    roomId: prefill?.roomId ?? "",
    checkIn,
    checkOut: prefill?.checkIn ? addDaysISO(prefill.checkIn, 2) : "",
    adults: 2,
    children: 0,
    status: "confirmed",
    notes: "",
    currency: "EUR",
  };
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  editId,
  prefill,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editId?: string | undefined;
  prefill?: ReservationPrefill | undefined;
}) {
  const { t, formatDate } = useI18n();
  const { formatCurrency } = useCurrency();
  const { reservations, rooms, guests, saveReservation, saveGuest } = useHotelData();
  const editing = editId ? reservations.find((r) => r.id === editId) : undefined;

  const [draft, setDraft] = useState<ReservationDraft>(emptyDraft(prefill));
  const [guestMode, setGuestMode] = useState<"existing" | "new">("existing");
  const [newGuest, setNewGuest] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = editing ? { ...editing } : emptyDraft(prefill);
    if (!initial.checkIn) {
      initial.checkIn = todayISO();
      initial.checkOut = addDaysISO(initial.checkIn, 2);
    }
    setDraft(initial);
    setGuestMode("existing");
    setNewGuest({ firstName: "", lastName: "", email: "", phone: "" });
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const set = <K extends keyof ReservationDraft>(k: K, v: ReservationDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const newGuestErrors = useMemo(() => {
    if (guestMode !== "new") return {};
    const e: Record<string, string> = {};
    if (!newGuest.firstName.trim()) e["firstName"] = t("err.required");
    if (!newGuest.lastName.trim()) e["lastName"] = t("err.required");
    if (newGuest.email && !isValidEmail(newGuest.email)) e["email"] = t("err.email");
    return e;
  }, [guestMode, newGuest, t]);

  const errors: ReservationErrors = validateReservation(
    guestMode === "new" ? { ...draft, guestId: "pending-new" } : draft,
    reservations,
    rooms,
  );
  const show = (k: keyof ReservationErrors) =>
    submitted && errors[k] ? t(`err.${errors[k]!}`) : undefined;
  const nights = draft.checkIn && draft.checkOut ? diffDays(draft.checkOut, draft.checkIn) : 0;

  function submit() {
    setSubmitted(true);
    if (Object.keys(errors).length || Object.keys(newGuestErrors).length) {
      toast.error(t("common.fixErrors"));
      return;
    }
    let guestId = draft.guestId;
    if (guestMode === "new") {
      const g = saveGuest({ ...newGuest, nationality: "", notes: "" });
      guestId = g.id;
      toast.success(t("res.guestCreated", { name: guestName(g) }));
    }
    const saved = saveReservation({ ...draft, guestId });
    toast.success(t(editing ? "res.updated" : "res.created", { ref: saved.reference }));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("res.edit") : t("res.new")}
            {editing && (
              <span className="ml-2 font-mono text-sm text-muted-foreground">
                {editing.reference}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{t("common.prototypeNote")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <section className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>{t("res.guest")}</Label>
              {!editing && (
                <Tabs
                  value={guestMode}
                  onValueChange={(v) => setGuestMode(v as "existing" | "new")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="existing" className="text-xs">
                      {t("res.existingGuest")}
                    </TabsTrigger>
                    <TabsTrigger value="new" className="text-xs">
                      {t("res.newGuest")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            {guestMode === "existing" ? (
              <>
                <Select value={draft.guestId} onValueChange={(v) => set("guestId", v)}>
                  <SelectTrigger aria-invalid={!!show("guestId")}>
                    <SelectValue placeholder={t("res.selectGuest")} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...guests]
                      .sort((a, b) => a.lastName.localeCompare(b.lastName))
                      .map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {guestName(g)} <span className="text-muted-foreground">· {g.email}</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FieldError message={show("guestId")} />
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/40 p-3">
                {(["firstName", "lastName", "email", "phone"] as const).map((k) => (
                  <div key={k} className="grid gap-1.5">
                    <Label htmlFor={`ng-${k}`} className="text-xs">
                      {t(`guests.${k}`)}
                    </Label>
                    <Input
                      id={`ng-${k}`}
                      value={newGuest[k]}
                      onChange={(e) => setNewGuest((g) => ({ ...g, [k]: e.target.value }))}
                    />
                    <FieldError message={submitted ? newGuestErrors[k as string] : undefined} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="checkIn">{t("res.checkIn")}</Label>
              <DatePicker
                id="checkIn"
                value={draft.checkIn}
                onChange={(d) => set("checkIn", d)}
                aria-invalid={!!show("checkIn")}
              />
              <FieldError message={show("checkIn")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="checkOut">{t("res.checkOut")}</Label>
              <DatePicker
                id="checkOut"
                value={draft.checkOut}
                min={draft.checkIn ? addDaysISO(draft.checkIn, 1) : undefined}
                onChange={(d) => set("checkOut", d)}
                aria-invalid={!!show("checkOut")}
              />
              <FieldError message={show("checkOut")} />
            </div>
            <div className="col-span-2 flex flex-wrap items-center justify-between gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Info className="size-3.5 shrink-0" />
                {nights > 0 ? (
                  <span>
                    <strong className="text-foreground font-semibold">
                      {t("res.nights", { count: nights })}.
                    </strong>
                    {draft.roomId && (
                      <span className="ml-2 font-medium text-primary">
                        Est. Total:{" "}
                        {formatCurrency(
                          (ROOM_RATES[rooms.find((r) => r.id === draft.roomId)?.type as RoomType] ??
                            140) * nights,
                          { currency: draft.currency },
                        )}
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{t("res.halfOpenHint")}</span>
                )}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 grid gap-1.5">
              <Label>{t("res.room")}</Label>
              <Select value={draft.roomId} onValueChange={(v) => set("roomId", v)}>
                <SelectTrigger aria-invalid={!!show("roomId")}>
                  <SelectValue placeholder={t("res.selectRoom")} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => {
                    const free = isRoomAvailable(
                      r,
                      draft.checkIn,
                      draft.checkOut,
                      reservations,
                      draft.id,
                    );
                    return (
                      <SelectItem key={r.id} value={r.id} disabled={!free && r.id !== draft.roomId}>
                        <span className="font-mono font-medium">{r.number}</span> ·{" "}
                        {t(`roomType.${r.type}`)} · {formatCurrency(ROOM_RATES[r.type])}/night ·{" "}
                        {r.capacity} guests
                        {!free && (
                          <span className="text-destructive">
                            {" "}
                            — {t("res.roomUnavailableShort")}
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FieldError message={show("roomId")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adults">{t("res.adults")}</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                max={8}
                value={draft.adults}
                onChange={(e) => set("adults", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="children">{t("res.children")}</Label>
              <Input
                id="children"
                type="number"
                min={0}
                max={6}
                value={draft.children}
                onChange={(e) => set("children", Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="col-span-full -mt-1">
              <FieldError message={show("adults")} />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>{t("res.status")}</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => set("status", v as ReservationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <Select
                value={draft.currency}
                onValueChange={(v) => set("currency", v as "EUR" | "USD" | "GBP" | "TRY")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="notes">{t("common.notes")}</Label>
              <Textarea
                id="notes"
                rows={2}
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </section>
          {draft.checkIn && editing && (
            <p className="text-xs text-muted-foreground">
              {formatDate(draft.checkIn)} → {draft.checkOut && formatDate(draft.checkOut)}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit}>{editing ? t("common.save") : t("res.new")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
