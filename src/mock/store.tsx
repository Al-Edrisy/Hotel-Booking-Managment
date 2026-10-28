import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { nextReference, type ReservationDraft } from "@/lib/reservations";
import type {
  Activity,
  ActivityKind,
  Guest,
  HotelSettings,
  Reservation,
  ReservationStatus,
  Role,
  Room,
  StaffMember,
} from "@/types";
import {
  createSeedActivity,
  createSeedReservations,
  seedGuests,
  seedRoles,
  seedRooms,
  seedSettings,
  seedStaff,
} from "./seed";

/**
 * Prototype data layer. Holds everything in memory (resets on reload).
 * Replace these actions with calls to the local backend later — components only use this hook.
 */
interface HotelData {
  rooms: Room[];
  reservations: Reservation[];
  guests: Guest[];
  staff: StaffMember[];
  roles: Role[];
  settings: HotelSettings;
  activity: Activity[];
}

interface HotelActions {
  saveReservation: (draft: ReservationDraft) => Reservation;
  setReservationStatus: (id: string, status: ReservationStatus) => void;
  saveGuest: (guest: Omit<Guest, "id"> & { id?: string }) => Guest;
  saveRoom: (room: Omit<Room, "id"> & { id?: string }) => Room;
  saveStaff: (member: Omit<StaffMember, "id"> & { id?: string }) => StaffMember;
  saveSettings: (settings: HotelSettings) => void;
}

const Ctx = createContext<(HotelData & HotelActions) | null>(null);

let counter = 0;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function HotelDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HotelData>(() => ({
    rooms: seedRooms,
    reservations: createSeedReservations(),
    guests: seedGuests,
    staff: seedStaff,
    roles: seedRoles,
    settings: seedSettings,
    activity: createSeedActivity(),
  }));

  const log = (d: HotelData, kind: ActivityKind, subject: string): Activity[] => [
    { id: newId("act"), at: format(new Date(), "yyyy-MM-dd'T'HH:mm"), kind, subject },
    ...d.activity,
  ];

  const saveReservation = useCallback((draft: ReservationDraft) => {
    let saved!: Reservation;
    setData((d) => {
      const existing = draft.id ? d.reservations.find((r) => r.id === draft.id) : undefined;
      saved = existing
        ? { ...existing, ...draft, id: existing.id }
        : { ...draft, id: newId("res"), reference: nextReference(d.reservations) };
      return {
        ...d,
        reservations: existing
          ? d.reservations.map((r) => (r.id === saved.id ? saved : r))
          : [...d.reservations, saved],
        activity: log(d, existing ? "reservation_updated" : "reservation_created", saved.reference),
      };
    });
    return saved;
  }, []);

  const setReservationStatus = useCallback((id: string, status: ReservationStatus) => {
    setData((d) => {
      const r = d.reservations.find((x) => x.id === id);
      if (!r) return d;
      const kind: ActivityKind =
        status === "cancelled"
          ? "reservation_cancelled"
          : status === "checked_in"
            ? "checked_in"
            : status === "checked_out"
              ? "checked_out"
              : "reservation_updated";
      return {
        ...d,
        reservations: d.reservations.map((x) => (x.id === id ? { ...x, status } : x)),
        activity: log(d, kind, r.reference),
      };
    });
  }, []);

  const saveGuest = useCallback((g: Omit<Guest, "id"> & { id?: string }) => {
    const saved: Guest = { ...g, id: g.id ?? newId("g") };
    setData((d) => ({
      ...d,
      guests: g.id ? d.guests.map((x) => (x.id === g.id ? saved : x)) : [...d.guests, saved],
      activity: log(d, "guest_saved", `${saved.firstName} ${saved.lastName}`),
    }));
    return saved;
  }, []);

  const saveRoom = useCallback((room: Omit<Room, "id"> & { id?: string }) => {
    const saved: Room = { ...room, id: room.id ?? newId("r") };
    setData((d) => ({
      ...d,
      rooms: room.id
        ? d.rooms.map((x) => (x.id === room.id ? saved : x))
        : [...d.rooms, saved].sort((a, b) => a.number.localeCompare(b.number)),
      activity: log(d, "room_saved", saved.number),
    }));
    return saved;
  }, []);

  const saveStaff = useCallback((m: Omit<StaffMember, "id"> & { id?: string }) => {
    const saved: StaffMember = { ...m, id: m.id ?? newId("s") };
    setData((d) => ({
      ...d,
      staff: m.id ? d.staff.map((x) => (x.id === m.id ? saved : x)) : [...d.staff, saved],
      activity: log(d, "staff_saved", saved.name),
    }));
    return saved;
  }, []);

  const saveSettings = useCallback((settings: HotelSettings) => {
    setData((d) => ({ ...d, settings, activity: log(d, "settings_saved", settings.hotelName) }));
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      saveReservation,
      setReservationStatus,
      saveGuest,
      saveRoom,
      saveStaff,
      saveSettings,
    }),
    [data, saveReservation, setReservationStatus, saveGuest, saveRoom, saveStaff, saveSettings],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHotelData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHotelData must be used inside HotelDataProvider");
  return ctx;
}
