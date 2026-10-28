import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BedDouble, CalendarRange, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { guestName, indexById } from "@/lib/selectors";
import { useHotelData } from "@/mock/store";

export function QuickFind() {
  const { t, formatDate } = useI18n();
  const { guests, reservations, rooms } = useHotelData();
  const { openDetail } = useReservationUI();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const guestById = indexById(guests);
  const roomById = indexById(rooms);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-64 justify-start gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">{t("common.quickFind")}</span>
        <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("common.quickFindPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("common.noResults")}</CommandEmpty>
          <CommandGroup heading={t("nav.reservations")}>
            {reservations.map((r) => (
              <CommandItem
                key={r.id}
                value={`${r.reference} ${guestName(guestById[r.guestId])}`}
                onSelect={() => go(() => openDetail(r.id))}
              >
                <CalendarRange />
                <span className="font-mono">{r.reference}</span>
                <span>{guestName(guestById[r.guestId])}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {roomById[r.roomId]?.number} · {formatDate(r.checkIn, "dayMonth")}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("nav.guests")}>
            {guests.map((g) => (
              <CommandItem
                key={g.id}
                value={`${guestName(g)} ${g.email} ${g.phone}`}
                onSelect={() => go(() => navigate({ to: "/guests", search: { q: guestName(g) } }))}
              >
                <User />
                {guestName(g)}
                <span className="ml-auto text-xs text-muted-foreground">{g.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("nav.rooms")}>
            {rooms.map((r) => (
              <CommandItem
                key={r.id}
                value={`room ${r.number} oda ${t(`roomType.${r.type}`)}`}
                onSelect={() => go(() => navigate({ to: "/rooms", search: { q: r.number } }))}
              >
                <BedDouble />
                <span className="font-mono">{r.number}</span> {t(`roomType.${r.type}`)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
