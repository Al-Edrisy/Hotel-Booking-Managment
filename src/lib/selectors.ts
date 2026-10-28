import type { Guest, OccupancyStatus, Reservation, Room } from "@/types";
import { isBlocking } from "./reservations";

/** A room is occupied while a guest is checked in. */
export function roomOccupancy(room: Room, reservations: Reservation[]): OccupancyStatus {
  return reservations.some((r) => r.roomId === room.id && r.status === "checked_in")
    ? "occupied"
    : "vacant";
}

export function currentStay(room: Room, reservations: Reservation[]): Reservation | undefined {
  return reservations.find((r) => r.roomId === room.id && r.status === "checked_in");
}

export function arrivalsOn(day: string, reservations: Reservation[]) {
  return reservations.filter((r) => r.checkIn === day && isBlocking(r));
}

export function departuresOn(day: string, reservations: Reservation[]) {
  return reservations.filter(
    (r) => r.checkOut === day && (r.status === "checked_in" || r.status === "checked_out"),
  );
}

export function hotelStats(today: string, rooms: Room[], reservations: Reservation[]) {
  const occupied = rooms.filter((r) => roomOccupancy(r, reservations) === "occupied").length;
  const outOfOrder = rooms.filter((r) => r.operationalStatus === "out_of_order").length;
  const attention = rooms.filter((r) => r.operationalStatus !== "in_service").length;
  const available = rooms.filter(
    (r) => r.operationalStatus !== "out_of_order" && roomOccupancy(r, reservations) === "vacant",
  ).length;
  return {
    total: rooms.length,
    occupied,
    available,
    attention,
    outOfOrder,
    arrivals: arrivalsOn(today, reservations).length,
    departures: departuresOn(today, reservations).length,
    occupancyRate: rooms.length - outOfOrder > 0 ? occupied / (rooms.length - outOfOrder) : 0,
  };
}

export const guestName = (g?: Guest) => (g ? `${g.firstName} ${g.lastName}` : "—");

export function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((i) => [i.id, i]));
}
