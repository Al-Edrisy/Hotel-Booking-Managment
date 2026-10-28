import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BedDouble, CalendarRange, Search, Sparkles, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ReservationStatusBadge } from "@/components/shared/StatusBadge";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { guestName, indexById } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";

export function TopBarSearch() {
  const { t, formatDate } = useI18n();
  const { guests, reservations, rooms } = useHotelData();
  const { openDetail } = useReservationUI();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const guestById = useMemo(() => indexById(guests), [guests]);
  const roomById = useMemo(() => indexById(rooms), [rooms]);

  // Global hotkey ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const filteredReservations = useMemo(() => {
    if (!cleanQuery) return reservations.slice(0, 5);
    return reservations
      .filter((r) => {
        const gName = guestName(guestById[r.guestId]).toLowerCase();
        const rNum = (roomById[r.roomId]?.number ?? "").toLowerCase();
        const ref = r.reference.toLowerCase();
        return (
          ref.includes(cleanQuery) ||
          gName.includes(cleanQuery) ||
          rNum.includes(cleanQuery) ||
          r.status.toLowerCase().includes(cleanQuery)
        );
      })
      .slice(0, 6);
  }, [reservations, cleanQuery, guestById, roomById]);

  const filteredGuests = useMemo(() => {
    if (!cleanQuery) return guests.slice(0, 4);
    return guests
      .filter((g) => {
        const full = `${g.firstName} ${g.lastName}`.toLowerCase();
        const phone = (g.phone ?? "").toLowerCase();
        const email = (g.email ?? "").toLowerCase();
        return (
          full.includes(cleanQuery) || phone.includes(cleanQuery) || email.includes(cleanQuery)
        );
      })
      .slice(0, 5);
  }, [guests, cleanQuery]);

  const filteredRooms = useMemo(() => {
    if (!cleanQuery) return rooms.slice(0, 4);
    return rooms
      .filter((room) => {
        const num = room.number.toLowerCase();
        const type = room.type.toLowerCase();
        const status = room.operationalStatus.toLowerCase();
        return num.includes(cleanQuery) || type.includes(cleanQuery) || status.includes(cleanQuery);
      })
      .slice(0, 5);
  }, [rooms, cleanQuery]);

  const totalResults = filteredReservations.length + filteredGuests.length + filteredRooms.length;

  const handleSelectReservation = (reservationId: string) => {
    setIsOpen(false);
    openDetail(reservationId);
  };

  const handleSelectGuest = (guestNameStr: string) => {
    setIsOpen(false);
    navigate({ to: "/guests", search: { q: guestNameStr } });
  };

  const handleSelectRoom = (roomNum: string) => {
    setIsOpen(false);
    navigate({ to: "/rooms", search: { q: roomNum } });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[120px] xs:max-w-[170px] sm:w-64 md:w-80 lg:w-96"
      suppressHydrationWarning
    >
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t("common.quickFindPlaceholder")}
          className="h-9 w-full rounded-md border-border bg-muted/40 pl-8 sm:pl-9 pr-6 sm:pr-14 text-xs transition-colors hover:bg-muted/60 focus:bg-background"
          aria-label="Search hotel records"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          ) : (
            <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[calc(100vw-2rem)] sm:w-full min-w-[270px] sm:min-w-[360px] max-w-[460px] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          <Command className="rounded-lg border-none" shouldFilter={false}>
            <CommandList className="max-h-[380px] overflow-y-auto p-1">
              {totalResults === 0 ? (
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                  {t("common.noResults")}
                </CommandEmpty>
              ) : null}

              {filteredReservations.length > 0 && (
                <CommandGroup
                  heading={
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
                      <CalendarRange className="size-3.5" />
                      <span>{t("nav.reservations")}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1">
                        {filteredReservations.length}
                      </Badge>
                    </div>
                  }
                >
                  {filteredReservations.map((res) => {
                    const guest = guestById[res.guestId];
                    const room = roomById[res.roomId];
                    return (
                      <CommandItem
                        key={res.id}
                        onSelect={() => handleSelectReservation(res.id)}
                        className="cursor-pointer px-2 py-1.5"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono font-medium text-foreground">
                                {res.reference}
                              </span>
                              <span className="truncate text-muted-foreground">
                                {guest ? guestName(guest) : "—"}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>Room {room?.number ?? "Unassigned"}</span>
                              <span>·</span>
                              <span>
                                {formatDate(res.checkIn, "short")} →{" "}
                                {formatDate(res.checkOut, "short")}
                              </span>
                            </div>
                          </div>
                          <ReservationStatusBadge status={res.status} />
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {filteredGuests.length > 0 && (
                <CommandGroup
                  heading={
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
                      <User className="size-3.5" />
                      <span>{t("nav.guests")}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1">
                        {filteredGuests.length}
                      </Badge>
                    </div>
                  }
                >
                  {filteredGuests.map((guest) => {
                    const fullName = guestName(guest);
                    return (
                      <CommandItem
                        key={guest.id}
                        onSelect={() => handleSelectGuest(fullName)}
                        className="cursor-pointer px-2 py-1.5"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-foreground">{fullName}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {guest.phone || guest.email || "No contact info"}
                            </div>
                          </div>
                          {guest.nationality && (
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {guest.nationality}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {filteredRooms.length > 0 && (
                <CommandGroup
                  heading={
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
                      <BedDouble className="size-3.5" />
                      <span>{t("nav.rooms")}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1">
                        {filteredRooms.length}
                      </Badge>
                    </div>
                  }
                >
                  {filteredRooms.map((room) => (
                    <CommandItem
                      key={room.id}
                      onSelect={() => handleSelectRoom(room.number)}
                      className="cursor-pointer px-2 py-1.5"
                    >
                      <div className="flex w-full items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{room.number}</span>
                          <span className="capitalize text-muted-foreground">
                            {room.type} (Floor {room.floor})
                          </span>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {room.operationalStatus.replace("_", " ")}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
