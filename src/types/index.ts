/** ISO calendar date, "yyyy-MM-dd" (hotel-local, no time zone). */
export type ISODate = string;

export type RoomType = "standard" | "deluxe" | "family" | "suite";
/** Operational status is independent of occupancy. */
export type OperationalStatus = "in_service" | "needs_attention" | "out_of_order";
export type OccupancyStatus = "vacant" | "occupied";

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  operationalStatus: OperationalStatus;
  notes: string;
}

export type ReservationStatus =
  "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export interface Reservation {
  id: string;
  reference: string;
  guestId: string;
  roomId: string;
  /** Occupancy is the half-open interval [checkIn, checkOut). */
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  status: ReservationStatus;
  notes: string;
  currency: "EUR" | "USD" | "GBP" | "TRY";
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  notes: string;
}

export type Permission =
  | "reservations.view"
  | "reservations.manage"
  | "rooms.manage"
  | "guests.manage"
  | "staff.manage"
  | "settings.manage"
  | "backup.manage";

export interface Role {
  id: string;
  name: string;
  /** Default permissions applied when a staff member is given this role. */
  permissions: Permission[];
}

export type StaffStatus = "active" | "inactive";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: StaffStatus;
  permissions: Permission[];
}

export type AccentColor = "forest" | "navy" | "terracotta" | "plum" | "charcoal";
export type DateStyle = "short" | "medium" | "long";

export interface HotelSettings {
  hotelName: string;
  operatorLabel: string;
  logoDataUrl: string | null;
  email: string;
  phone: string;
  address: string;
  timeZone: string;
  accentColor: AccentColor;
  dateStyle: DateStyle;
  weekStartsOn: 0 | 1;
  compactTables: boolean;
}

export type ActivityKind =
  | "reservation_created"
  | "reservation_updated"
  | "reservation_cancelled"
  | "checked_in"
  | "checked_out"
  | "guest_saved"
  | "room_saved"
  | "staff_saved"
  | "settings_saved";

export interface Activity {
  id: string;
  /** Local "yyyy-MM-ddTHH:mm". */
  at: string;
  kind: ActivityKind;
  /** Untranslated subject, e.g. a reservation reference or room number. */
  subject: string;
}
