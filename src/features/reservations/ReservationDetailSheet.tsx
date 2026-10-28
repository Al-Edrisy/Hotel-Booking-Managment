import { useState } from "react";
import { toast } from "sonner";
import { LogIn, LogOut, Pencil, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DetailRow } from "@/components/shared/PageHeader";
import { ReservationStatusBadge } from "@/components/shared/StatusBadge";
import { useI18n } from "@/i18n";
import { useCurrency } from "@/lib/currency";
import { diffDays } from "@/lib/dates";
import { guestName } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";
import type { RoomType } from "@/types";

const ROOM_RATES: Record<RoomType, number> = {
  standard: 140,
  deluxe: 195,
  family: 240,
  suite: 330,
};

export function ReservationDetailSheet({
  id,
  onClose,
  onEdit,
}: {
  id?: string | undefined;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const { t, formatDate } = useI18n();
  const { formatCurrency } = useCurrency();
  const { reservations, rooms, guests, setReservationStatus } = useHotelData();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const r = reservations.find((x) => x.id === id);
  const guest = guests.find((g) => g.id === r?.guestId);
  const room = rooms.find((x) => x.id === r?.roomId);

  const nights = r ? diffDays(r.checkOut, r.checkIn) : 0;
  const nightlyRate = room ? ROOM_RATES[room.type] : 140;
  const estTotal = nightlyRate * Math.max(nights, 1);

  const changeStatus = (status: "checked_in" | "checked_out") => {
    if (!r) return;
    setReservationStatus(r.id, status);
    toast.success(t("res.statusChanged", { ref: r.reference, status: t(`status.${status}`) }));
  };

  return (
    <>
      <Sheet open={!!r} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {r && (
            <>
              <SheetHeader>
                <SheetDescription>{t("res.detail")}</SheetDescription>
                <SheetTitle className="flex items-center gap-3 font-mono text-lg">
                  {r.reference} <ReservationStatusBadge status={r.status} />
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4">
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("res.stay")}
                  </h3>
                  <DetailRow label={t("res.room")}>
                    <span className="font-mono">{room?.number}</span> ·{" "}
                    {room && t(`roomType.${room.type}`)}
                  </DetailRow>
                  <DetailRow label={t("res.checkIn")}>{formatDate(r.checkIn)}</DetailRow>
                  <DetailRow label={t("res.checkOut")}>{formatDate(r.checkOut)}</DetailRow>
                  <DetailRow label=" ">{t("res.nights", { count: nights })}</DetailRow>
                  <DetailRow label="Est. Total">
                    <span className="font-semibold text-primary">
                      {formatCurrency(estTotal, { currency: r.currency })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      ({formatCurrency(nightlyRate, { currency: r.currency })}/night)
                    </span>
                  </DetailRow>
                  <DetailRow label={t("res.guests")}>
                    {r.adults} {t("res.adults").toLowerCase()}
                    {r.children > 0 && `, ${r.children} ${t("res.children").toLowerCase()}`}
                  </DetailRow>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("res.contact")}
                  </h3>
                  <DetailRow label={t("res.guest")}>{guestName(guest)}</DetailRow>
                  <DetailRow label={t("guests.email")}>{guest?.email || "—"}</DetailRow>
                  <DetailRow label={t("guests.phone")}>{guest?.phone || "—"}</DetailRow>
                </div>
                {(r.notes || guest?.notes) && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("common.notes")}
                      </h3>
                      {r.notes && <p>{r.notes}</p>}
                      {guest?.notes && <p className="text-muted-foreground">{guest.notes}</p>}
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex flex-wrap gap-2 pb-6">
                  {(r.status === "confirmed" || r.status === "pending") && (
                    <Button size="sm" onClick={() => changeStatus("checked_in")}>
                      <LogIn /> {t("res.checkInAction")}
                    </Button>
                  )}
                  {r.status === "checked_in" && (
                    <Button size="sm" onClick={() => changeStatus("checked_out")}>
                      <LogOut /> {t("res.checkOutAction")}
                    </Button>
                  )}
                  {r.status !== "cancelled" && r.status !== "checked_out" && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(r.id)}>
                      <Pencil /> {t("common.edit")}
                    </Button>
                  )}
                  {(r.status === "confirmed" || r.status === "pending") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmCancel(true)}
                    >
                      <XCircle /> {t("res.cancelAction")}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CancelReservationDialog open={confirmCancel} onOpenChange={setConfirmCancel} id={r?.id} />
    </>
  );
}

export function CancelReservationDialog({
  open,
  onOpenChange,
  id,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  id?: string | undefined;
}) {
  const { t } = useI18n();
  const { reservations, setReservationStatus } = useHotelData();
  const r = reservations.find((x) => x.id === id);
  return (
    <AlertDialog open={open && !!r} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("res.cancelConfirmTitle", { ref: r?.reference ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("res.cancelConfirmBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("res.keep")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (!r) return;
              setReservationStatus(r.id, "cancelled");
              toast.success(t("res.cancelled", { ref: r.reference }));
            }}
          >
            {t("res.cancelAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
