import type { Reservation, ReservationStatus, Room } from "@/types";
import { rangesOverlap } from "./dates";

/** Statuses that hold a room for their nights. */
export const BLOCKING_STATUSES: ReservationStatus[] = ["pending", "confirmed", "checked_in"];

export const isBlocking = (r: Pick<Reservation, "status">) => BLOCKING_STATUSES.includes(r.status);

export type ReservationDraft = Omit<Reservation, "id" | "reference"> & { id?: string | undefined };

export type ReservationErrorKey =
  | "guestRequired"
  | "roomRequired"
  | "checkInRequired"
  | "checkOutRequired"
  | "checkOutAfterCheckIn"
  | "adultsMin"
  | "overCapacity"
  | "roomOutOfOrder"
  | "roomUnavailable";

export type ReservationErrors = Partial<
  Record<keyof ReservationDraft | "form", ReservationErrorKey>
>;

/** Blocking reservations on the same room whose nights overlap the draft's nights. */
export function findConflicts(draft: ReservationDraft, reservations: Reservation[]): Reservation[] {
  if (!draft.roomId || !draft.checkIn || !draft.checkOut) return [];
  return reservations.filter(
    (r) =>
      r.id !== draft.id &&
      r.roomId === draft.roomId &&
      isBlocking(r) &&
      rangesOverlap(draft.checkIn, draft.checkOut, r.checkIn, r.checkOut),
  );
}

export function isRoomAvailable(
  room: Room,
  checkIn: string,
  checkOut: string,
  reservations: Reservation[],
  excludeId?: string | undefined,
): boolean {
  if (room.operationalStatus === "out_of_order") return false;
  if (!checkIn || !checkOut || checkOut <= checkIn) return true;
  return (
    findConflicts(
      {
        id: excludeId,
        roomId: room.id,
        checkIn,
        checkOut,
        guestId: "",
        adults: 1,
        children: 0,
        status: "confirmed",
        notes: "",
      },
      reservations,
    ).length === 0
  );
}

export function validateReservation(
  draft: ReservationDraft,
  reservations: Reservation[],
  rooms: Room[],
): ReservationErrors {
  const errors: ReservationErrors = {};
  if (!draft.guestId) errors.guestId = "guestRequired";
  if (!draft.roomId) errors.roomId = "roomRequired";
  if (!draft.checkIn) errors.checkIn = "checkInRequired";
  if (!draft.checkOut) errors.checkOut = "checkOutRequired";
  if (draft.checkIn && draft.checkOut && draft.checkOut <= draft.checkIn)
    errors.checkOut = "checkOutAfterCheckIn";
  if (draft.adults < 1) errors.adults = "adultsMin";

  const room = rooms.find((r) => r.id === draft.roomId);
  // Cancelled / completed stays do not hold the room, so only check active ones.
  if (room && isBlocking(draft)) {
    if (draft.adults + draft.children > room.capacity) errors.adults = "overCapacity";
    if (room.operationalStatus === "out_of_order") errors.roomId = "roomOutOfOrder";
    else if (!errors.checkOut && findConflicts(draft, reservations).length > 0)
      errors.roomId = "roomUnavailable";
  }
  return errors;
}

export function nextReference(reservations: Reservation[]): string {
  const max = reservations.reduce(
    (m, r) => Math.max(m, Number(r.reference.split("-")[1]) || 0),
    1000,
  );
  return `22B-${max + 1}`;
}
