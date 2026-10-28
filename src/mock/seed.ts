import { addDaysISO, todayISO } from "@/lib/dates";
import type {
  Activity,
  Guest,
  HotelSettings,
  Reservation,
  ReservationStatus,
  Role,
  Room,
  StaffMember,
} from "@/types";

// All data is fictional. Reservation dates are relative to today so the prototype always looks current.

export const seedRooms: Room[] = [
  {
    id: "r101",
    number: "101",
    type: "standard",
    floor: 1,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r102",
    number: "102",
    type: "standard",
    floor: 1,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r103",
    number: "103",
    type: "deluxe",
    floor: 1,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "Garden view.",
  },
  {
    id: "r104",
    number: "104",
    type: "deluxe",
    floor: 1,
    capacity: 3,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r105",
    number: "105",
    type: "family",
    floor: 1,
    capacity: 4,
    operationalStatus: "out_of_order",
    notes: "Bathroom renovation in progress.",
  },
  {
    id: "r201",
    number: "201",
    type: "standard",
    floor: 2,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r202",
    number: "202",
    type: "standard",
    floor: 2,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r203",
    number: "203",
    type: "deluxe",
    floor: 2,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "Balcony.",
  },
  {
    id: "r204",
    number: "204",
    type: "deluxe",
    floor: 2,
    capacity: 3,
    operationalStatus: "needs_attention",
    notes: "Air conditioning reported noisy.",
  },
  {
    id: "r205",
    number: "205",
    type: "family",
    floor: 2,
    capacity: 4,
    operationalStatus: "in_service",
    notes: "Connecting door to 204.",
  },
  {
    id: "r301",
    number: "301",
    type: "suite",
    floor: 3,
    capacity: 3,
    operationalStatus: "in_service",
    notes: "Sea view, terrace.",
  },
  {
    id: "r302",
    number: "302",
    type: "suite",
    floor: 3,
    capacity: 3,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r303",
    number: "303",
    type: "deluxe",
    floor: 3,
    capacity: 2,
    operationalStatus: "in_service",
    notes: "",
  },
  {
    id: "r304",
    number: "304",
    type: "suite",
    floor: 3,
    capacity: 4,
    operationalStatus: "in_service",
    notes: "Penthouse suite.",
  },
];

export const seedGuests: Guest[] = [
  ["Ayşe", "Demirtaş", "TR"],
  ["Lukas", "Brenner", "DE"],
  ["Sophie", "Marchand", "FR"],
  ["Mehmet", "Yıldırım", "TR"],
  ["Emma", "Whitfield", "GB"],
  ["Giulia", "Rinaldi", "IT"],
  ["Can", "Özkaya", "TR"],
  ["Noah", "Lindqvist", "SE"],
  ["Zeynep", "Arslan", "TR"],
  ["Daniel", "Okafor", "NL"],
  ["Hana", "Kobayashi", "JP"],
  ["Marta", "Novak", "PL"],
  ["Burak", "Ercan", "TR"],
  ["Olivia", "Harrington", "US"],
  ["Elena", "Vasquez", "ES"],
  ["Selin", "Kurt", "TR"],
  ["Thomas", "Meyer", "AT"],
  ["Isabel", "Ferreira", "PT"],
].map(([firstName = "", lastName = "", nationality = ""], i) => ({
  id: `g${i + 1}`,
  firstName,
  lastName,
  nationality,
  email: `${firstName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "")}.${lastName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "")}@example.com`,
  phone: `+90 555 01${String(10 + i).padStart(2, "0")} ${String(200 + i * 7).slice(-3)}`,
  notes:
    i === 1
      ? "Prefers a quiet room on a higher floor."
      : i === 4
        ? "Allergic to feathers — synthetic pillows."
        : i === 10
          ? "Returning guest, late arrival usual."
          : "",
}));

// [roomId, guestId, check-in offset (days from today), nights, status, adults, children, notes]
type Row = [string, string, number, number, ReservationStatus, number, number, string?];
const rows: Row[] = [
  ["r101", "g12", -9, 3, "checked_out", 2, 0],
  ["r101", "g2", -4, 4, "checked_in", 1, 0, "Departing today."],
  ["r101", "g5", 0, 3, "confirmed", 2, 0, "Arrives on the same day the previous guest leaves."],
  ["r102", "g3", -2, 5, "checked_in", 2, 0],
  ["r102", "g14", 5, 2, "confirmed", 2, 0],
  ["r103", "g7", -6, 2, "checked_out", 2, 0],
  ["r103", "g11", 1, 4, "confirmed", 1, 0, "Late arrival around 23:00."],
  ["r104", "g1", -1, 3, "checked_in", 2, 1],
  ["r104", "g16", 3, 3, "pending", 2, 0],
  ["r105", "g10", 8, 3, "confirmed", 2, 2],
  ["r201", "g4", -3, 6, "checked_in", 1, 0],
  ["r201", "g8", 10, 2, "cancelled", 2, 0],
  ["r202", "g6", 0, 2, "confirmed", 2, 0],
  ["r202", "g13", 2, 5, "confirmed", 2, 0],
  ["r203", "g18", -12, 4, "checked_out", 2, 0],
  ["r203", "g17", -2, 2, "checked_in", 2, 0, "Departing today."],
  ["r204", "g15", 6, 4, "pending", 2, 1],
  ["r205", "g9", -5, 7, "checked_in", 2, 2],
  ["r205", "g12", 9, 3, "confirmed", 3, 0],
  ["r301", "g14", -2, 4, "checked_in", 2, 0, "Anniversary stay."],
  ["r301", "g2", 2, 3, "confirmed", 2, 0],
  ["r302", "g8", 0, 4, "confirmed", 2, 1],
  ["r302", "g3", 12, 5, "confirmed", 2, 0],
  ["r303", "g13", -8, 3, "checked_out", 1, 0],
  ["r303", "g6", -3, 2, "checked_out", 2, 0],
  ["r303", "g1", 7, 6, "confirmed", 2, 0],
  ["r304", "g11", -7, 3, "checked_out", 3, 1],
  ["r304", "g10", 1, 2, "pending", 2, 2],
];

export function createSeedReservations(today = todayISO()): Reservation[] {
  return rows.map(([roomId, guestId, offset, nights, status, adults, children, notes], i) => {
    const checkIn = addDaysISO(today, offset);
    return {
      id: `res${i + 1}`,
      reference: `22B-${1041 + i}`,
      roomId,
      guestId,
      checkIn,
      checkOut: addDaysISO(checkIn, nights),
      status,
      adults,
      children,
      notes: notes ?? "",
      currency: "EUR",
    };
  });
}

export const seedRoles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    permissions: [
      "reservations.view",
      "reservations.manage",
      "rooms.manage",
      "guests.manage",
      "staff.manage",
      "settings.manage",
      "backup.manage",
    ],
  },
  {
    id: "manager",
    name: "Front Office Manager",
    permissions: ["reservations.view", "reservations.manage", "rooms.manage", "guests.manage"],
  },
  {
    id: "reception",
    name: "Receptionist",
    permissions: ["reservations.view", "reservations.manage", "guests.manage"],
  },
  { id: "viewer", name: "Read-only", permissions: ["reservations.view"] },
];

export const seedStaff: StaffMember[] = [
  {
    id: "s1",
    name: "Elif Kaya",
    email: "elif.kaya@example.com",
    roleId: "admin",
    status: "active",
    permissions: seedRoles[0]!.permissions,
  },
  {
    id: "s2",
    name: "Murat Aksoy",
    email: "murat.aksoy@example.com",
    roleId: "manager",
    status: "active",
    permissions: seedRoles[1]!.permissions,
  },
  {
    id: "s3",
    name: "Deniz Şahin",
    email: "deniz.sahin@example.com",
    roleId: "reception",
    status: "active",
    permissions: seedRoles[2]!.permissions,
  },
  {
    id: "s4",
    name: "Ece Polat",
    email: "ece.polat@example.com",
    roleId: "reception",
    status: "active",
    permissions: [...seedRoles[2]!.permissions, "rooms.manage"],
  },
  {
    id: "s5",
    name: "Kerem Doğan",
    email: "kerem.dogan@example.com",
    roleId: "viewer",
    status: "inactive",
    permissions: seedRoles[3]!.permissions,
  },
];

export const seedSettings: HotelSettings = {
  hotelName: "22 Boutique Hotel",
  operatorLabel: "Operated by 7A",
  logoDataUrl: null,
  email: "frontdesk@22boutique.example",
  phone: "+90 252 000 22 22",
  address: "Kumbahçe Mah. 22. Sokak No: 22, Bodrum, Muğla",
  timeZone: "Europe/Istanbul",
  accentColor: "forest",
  dateStyle: "medium",
  weekStartsOn: 1,
  compactTables: false,
};

export function createSeedActivity(today = todayISO()): Activity[] {
  return [
    { id: "a1", at: `${today}T09:42`, kind: "checked_in", subject: "22B-1048" },
    { id: "a2", at: `${today}T09:05`, kind: "reservation_created", subject: "22B-1068" },
    { id: "a3", at: `${today}T08:31`, kind: "room_saved", subject: "204" },
    { id: "a4", at: `${addDaysISO(today, -1)}T18:12`, kind: "checked_out", subject: "22B-1066" },
    {
      id: "a5",
      at: `${addDaysISO(today, -1)}T15:47`,
      kind: "reservation_cancelled",
      subject: "22B-1052",
    },
  ];
}
