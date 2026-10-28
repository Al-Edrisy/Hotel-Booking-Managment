import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BedDouble,
  CalendarDays,
  CalendarRange,
  Clock,
  Compass,
  Crown,
  DoorOpen,
  Eye,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Wine,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHotelData } from "@/mock/store";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { useI18n } from "@/i18n";
import { todayISO } from "@/lib/dates";
import { hotelStats } from "@/lib/selectors";
import { LuxuryHotelCrest } from "@/components/brand/LuxuryHotelCrest";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "22 Boutique Hotel — Welcome & Showcase" },
      {
        name: "description",
        content:
          "Welcome to 22 Boutique Hotel. Discover signature luxury suites, curated amenities, and seamless front desk hospitality.",
      },
      {
        property: "og:title",
        content: "22 Boutique Hotel — Welcome & Showcase",
      },
      {
        property: "og:description",
        content:
          "Experience curated boutique hospitality with signature suites, fine dining, and bespoke concierge service.",
      },
    ],
  }),
  component: HomePage,
});

export function HomePage() {
  const { t, formatDate, formatNumber } = useI18n();
  const { settings, rooms, reservations, guests } = useHotelData();
  const { openNew } = useReservationUI();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();

  const today = todayISO();
  const stats = hotelStats(today, rooms, reservations);

  // Group suites by category
  const suites = [
    {
      id: "presidential",
      title: "Presidential Grand Suite",
      tagline: "Panoramic Courtyard Balcony & Private Salon",
      rate: 750,
      capacity: 4,
      size: "82 m²",
      bed: "Super King Bed",
      features: [
        "Private marble fireplace",
        "Deep soaking brass tub",
        "Dedicated VIP butler",
        "Complimentary grand breakfast",
      ],
      themeColor: "from-amber-900/60 via-amber-950/40 to-neutral-900",
      accent: "text-amber-400",
      roomNumber: "301",
    },
    {
      id: "royal-penthouse",
      title: "Royal Penthouse Suite",
      tagline: "Top-Floor Sanctuary with Skylight Terrace",
      rate: 920,
      capacity: 4,
      size: "95 m²",
      bed: "Emperor Silk Bed",
      features: [
        "Private rooftop garden terrace",
        "Vintage Champagne minibar",
        "Direct elevator access",
        "Aromatherapy steam shower",
      ],
      themeColor: "from-stone-900 via-neutral-900 to-black",
      accent: "text-amber-300",
      roomNumber: "401",
    },
    {
      id: "deluxe-garden",
      title: "Deluxe Garden Suite",
      tagline: "Serene Garden View with Reading Nook",
      rate: 420,
      capacity: 2,
      size: "46 m²",
      bed: "Plush King Bed",
      features: [
        "Private botanical patio",
        "Bespoke oak workstation",
        "Rainfall shower",
        "Artisanal tea station",
      ],
      themeColor: "from-emerald-950/50 via-neutral-900 to-neutral-950",
      accent: "text-emerald-400",
      roomNumber: "104",
    },
    {
      id: "heritage-salon",
      title: "Heritage Deluxe Room",
      tagline: "Classical Proportions & Modern Craftsmanship",
      rate: 340,
      capacity: 2,
      size: "38 m²",
      bed: "Queen Featherbed",
      features: [
        "Original high-ceiling mouldings",
        "Curated art collection",
        "Bluetooth acoustics",
        "Luxury botanical toiletries",
      ],
      themeColor: "from-slate-900 via-neutral-900 to-neutral-950",
      accent: "text-sky-300",
      roomNumber: "202",
    },
  ];

  const amenities = [
    {
      icon: UtensilsCrossed,
      title: "Le 22 Epicurean Restaurant",
      desc: "Seasonal Haute Cuisine featuring farm-to-table tasting menus curated by Chef Michel Roux.",
      hours: "07:00 – 23:00",
    },
    {
      icon: Wine,
      title: "The Subterranean Cellar",
      desc: "An intimate reserve cellar housing over 800 vintage labels with sommelier masterclasses.",
      hours: "17:00 – 01:00",
    },
    {
      icon: Waves,
      title: "Therapeutic Bathhouse & Spa",
      desc: "Heated Roman hydrotherapy pools, cedarwood sauna, and customized holistic skin rituals.",
      hours: "08:00 – 21:00",
    },
    {
      icon: Compass,
      title: "Bespoke Concierge & Chauffeur",
      desc: "Private airport transfers, museum after-hours reservations, and tailored local itineraries.",
      hours: "24/7 Dedicated Service",
    },
  ];

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      {/* 1. Grand Editorial Hero Banner */}
      <section
        aria-label="Hotel Welcome Banner"
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-neutral-950 text-white shadow-xl"
      >
        {/* Subtle background glow and architectural mesh */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,155,61,0.2)_0%,transparent_70%)] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(20,50,45,0.4)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Hospitality Welcome & Primary Action */}
          <div className="space-y-5 lg:col-span-7">
            {/* Live Operational Status Strip - Clean unboxed metadata */}
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300/90 tracking-wide">
              <span>Front Desk Active</span>
              <span aria-hidden="true" className="opacity-50">
                ·
              </span>
              <span>
                {stats.available} of {stats.total} Rooms Available Today
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8EB] leading-[1.15]">
                Timeless Grandeur. Curated Boutique Hospitality.
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                Welcome to {settings.hotelName}. Nestled in the historic quarter, we blend
                aristocratic heritage with discreet contemporary comfort.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate({ to: "/" })}
                className="gap-2 bg-gradient-to-r from-[#C99B3D] via-[#E4C572] to-[#C99B3D] text-[#0B0E0D] font-semibold hover:brightness-110 shadow-lg shadow-amber-900/20"
              >
                <LayoutDashboard className="size-4" />
                <span>Go to Operations Dashboard</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => openNew()}
                className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="size-4" />
                <span>New Reservation</span>
              </Button>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-neutral-400 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Crown className="size-3.5 text-amber-400" />
                <span className="text-neutral-200 font-medium">5-Star Boutique Rated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-amber-400" />
                <span>Historic District 1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-amber-400" />
                <span>+33 1 42 68 55 00</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hotel Crest & Live Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <LuxuryHotelCrest size={48} />
                  <div>
                    <h3 className="font-serif font-bold text-white text-base leading-tight">
                      {settings.hotelName}
                    </h3>
                    <p className="text-xs text-neutral-400" suppressHydrationWarning>
                      {formatDate(today, "long")}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-400/40 text-amber-300 text-[10px]">
                  {formatNumber(stats.occupancyRate, { style: "percent" })} Occupied
                </Badge>
              </div>

              {/* 3 Key Operational Figures */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    In-House
                  </div>
                  <div className="font-mono text-xl font-bold text-white tabular-nums">
                    {stats.occupied}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    Arrivals
                  </div>
                  <div className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                    {stats.arrivals}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    Departures
                  </div>
                  <div className="font-mono text-xl font-bold text-neutral-300 tabular-nums">
                    {stats.departures}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-300">
                <span>Front Desk Concierge</span>
                <span className="font-medium text-amber-300">Celine Laurent (Admin)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Rapid Front-Desk Command Strip */}
      <section aria-label="Quick Actions" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Front Desk Quick Actions
          </h2>
          <span className="text-xs text-muted-foreground">1-Click Direct Operations</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => openNew()}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="size-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-foreground">Create Reservation</span>
            <span className="text-[11px] text-muted-foreground">
              Book room for walk-in or phone
            </span>
          </button>

          <Link
            to="/calendar"
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-foreground">Room Calendar</span>
            <span className="text-[11px] text-muted-foreground">Visual rack view by night</span>
          </Link>

          <Link
            to="/rooms"
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BedDouble className="size-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-foreground">Room Directory</span>
            <span className="text-[11px] text-muted-foreground">
              {rooms.length} suites & housekeeping
            </span>
          </Link>

          <Link
            to="/guests"
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-foreground">VIP Guests</span>
            <span className="text-[11px] text-muted-foreground">{guests.length} guest records</span>
          </Link>
        </div>
      </section>

      {/* 3. Signature Suites Collection Showcase */}
      <section aria-label="Signature Suites Showcase" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Crown className="size-3.5" />
              <span>Signature Accommodations</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Curated Suites of Character & Distinction
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            Every suite is individually appointed with hand-selected antiques and bespoke Italian
            furnishings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {suites.map((suite) => (
            <Card
              key={suite.id}
              className="overflow-hidden border-border/80 transition-all hover:shadow-lg flex flex-col justify-between"
            >
              {/* Suite Header with Ambient Gradient */}
              <div className={`p-6 bg-gradient-to-br ${suite.themeColor} text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                      Room {suite.roomNumber} · {suite.size}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                      {suite.title}
                    </h3>
                    <p className="text-xs text-white/80 font-light mt-1">{suite.tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-white tabular-nums">
                      {formatMoney(suite.rate)}
                    </div>
                    <div className="text-[10px] text-white/70">per night</div>
                  </div>
                </div>
              </div>

              {/* Suite Specifications */}
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary" />
                      <span>Up to {suite.capacity} guests</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="size-3.5 text-primary" />
                      <span>{suite.bed}</span>
                    </span>
                  </div>

                  {/* Highlights list with clean typography */}
                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-foreground/90">
                    {suite.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-amber-500/80 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/70">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: "/rooms" })}
                    className="gap-1.5 text-xs"
                  >
                    <Eye className="size-3.5" />
                    <span>View Room Rack</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => openNew()}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                  >
                    <KeyRound className="size-3.5" />
                    <span>Book Suite</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Curated Boutique Amenities Bento */}
      <section aria-label="Boutique Amenities" className="space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bespoke Services
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            World-Class Hospitality Amenities
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item, idx) => (
            <Card key={idx} className="border-border/80 bg-card/60 p-5 space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-primary font-medium border-t border-border/50">
                <Clock className="size-3" />
                <span>{item.hours}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. General Manager Statement & Full-Width Jump to Ops */}
      <section
        aria-label="Operations Switcher Callout"
        className="rounded-2xl border border-border/90 bg-muted/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
            <span className="ml-2 text-xs font-mono text-muted-foreground">Boutique Standard</span>
          </div>
          <p className="font-serif text-lg italic text-foreground">
            "Every guest is an honored family friend. Every request is fulfilled before it is
            spoken."
          </p>
          <p className="text-xs text-muted-foreground">
            — Celine Laurent, General Manager & Front Desk Director
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Button size="lg" onClick={() => navigate({ to: "/" })} className="gap-2 shadow-sm">
            <LayoutDashboard className="size-4" />
            <span>Open Front Desk Dashboard</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
