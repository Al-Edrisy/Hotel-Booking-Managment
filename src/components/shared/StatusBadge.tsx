import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { OccupancyStatus, OperationalStatus, ReservationStatus } from "@/types";

/** Single source of truth for status → color mapping (also used by the calendar). */
export const reservationTone: Record<ReservationStatus, string> = {
  pending: "bg-pending-soft text-pending border-pending/30",
  confirmed: "bg-confirmed-soft text-confirmed border-confirmed/30",
  checked_in: "bg-inhouse-soft text-inhouse border-inhouse/30",
  checked_out: "bg-departed-soft text-departed border-departed/30",
  cancelled: "bg-cancelled-soft text-cancelled border-cancelled/30 line-through decoration-1",
};

export const reservationDot: Record<ReservationStatus, string> = {
  pending: "bg-pending",
  confirmed: "bg-confirmed",
  checked_in: "bg-inhouse",
  checked_out: "bg-departed",
  cancelled: "bg-cancelled",
};

const opTone: Record<OperationalStatus, string> = {
  in_service: "bg-departed-soft text-departed border-transparent",
  needs_attention: "bg-pending-soft text-pending border-pending/30",
  out_of_order: "bg-cancelled-soft text-cancelled border-cancelled/30",
};

const occTone: Record<OccupancyStatus, string> = {
  vacant: "bg-card text-muted-foreground border-border",
  occupied: "bg-inhouse-soft text-inhouse border-inhouse/30",
};

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium";

export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span className={cn(base, reservationTone[status], "no-underline", className)}>
      <span className={cn("size-1.5 rounded-full", reservationDot[status])} />
      <span className={status === "cancelled" ? "line-through" : ""}>{t(`status.${status}`)}</span>
    </span>
  );
}

export function OperationalBadge({ status }: { status: OperationalStatus }) {
  const { t } = useI18n();
  return <span className={cn(base, opTone[status])}>{t(`op.${status}`)}</span>;
}

export function OccupancyBadge({ status }: { status: OccupancyStatus }) {
  const { t } = useI18n();
  return (
    <span className={cn(base, occTone[status])}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "occupied" ? "bg-inhouse" : "bg-muted-foreground/40",
        )}
      />
      {t(`occupancy.${status}`)}
    </span>
  );
}
