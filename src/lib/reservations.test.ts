import { describe, expect, it } from "vitest";
import type { Reservation, Room } from "@/types";
import { rangesOverlap } from "./dates";
import { validateReservation, type ReservationDraft } from "./reservations";

const room: Room = {
  id: "r1",
  number: "101",
  type: "standard",
  floor: 1,
  capacity: 2,
  operationalStatus: "in_service",
  notes: "",
};
const existing: Reservation = {
  id: "a",
  reference: "22B-1001",
  guestId: "g1",
  roomId: "r1",
  checkIn: "2026-06-09",
  checkOut: "2026-06-12",
  adults: 2,
  children: 0,
  status: "confirmed",
  notes: "",
};
const draft = (p: Partial<ReservationDraft>): ReservationDraft => ({
  guestId: "g2",
  roomId: "r1",
  checkIn: "2026-06-12",
  checkOut: "2026-06-14",
  adults: 1,
  children: 0,
  status: "confirmed",
  notes: "",
  ...p,
});

describe("reservation date rules", () => {
  it("allows arrival on the previous guest's check-out date (June 12)", () => {
    expect(rangesOverlap("2026-06-09", "2026-06-12", "2026-06-12", "2026-06-14")).toBe(false);
    expect(validateReservation(draft({}), [existing], [room]).roomId).toBeUndefined();
  });

  it("rejects a stay that overlaps an existing night", () => {
    expect(validateReservation(draft({ checkIn: "2026-06-11" }), [existing], [room]).roomId).toBe(
      "roomUnavailable",
    );
  });

  it("requires check-out later than check-in", () => {
    expect(validateReservation(draft({ checkOut: "2026-06-12" }), [], [room]).checkOut).toBe(
      "checkOutAfterCheckIn",
    );
  });

  it("ignores cancelled reservations when checking conflicts", () => {
    const cancelled = { ...existing, status: "cancelled" as const };
    expect(
      validateReservation(draft({ checkIn: "2026-06-10" }), [cancelled], [room]).roomId,
    ).toBeUndefined();
  });

  it("blocks out-of-order rooms", () => {
    expect(
      validateReservation(draft({}), [], [{ ...room, operationalStatus: "out_of_order" }]).roomId,
    ).toBe("roomOutOfOrder");
  });
});
