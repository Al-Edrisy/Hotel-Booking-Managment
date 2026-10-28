import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity as ActivityIcon,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Coins,
  DollarSign,
  Filter,
  Globe2,
  HelpCircle,
  Info,
  Layers,
  Percent,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { addDaysISO, diffDays, todayISO } from "@/lib/dates";
import { useHotelData } from "@/mock/store";
import { useCurrency, CURRENCY_LIST, type CurrencyCode } from "@/lib/currency";
import type { Reservation, Room, RoomType } from "@/types";

// Base nightly rate estimates by category for 22 Boutique Hotel in EUR
const ROOM_RATES_EUR: Record<RoomType, number> = {
  standard: 140,
  deluxe: 195,
  family: 240,
  suite: 330,
};

type TimeHorizon = "7" | "14" | "30";

export function AnalyticsDashboard() {
  const { rooms, reservations, guests } = useHotelData();
  const { currency, setCurrency, formatCurrency, convertFromEUR, currencySymbol } = useCurrency();
  const [horizon, setHorizon] = useState<TimeHorizon>("7");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");

  const today = useMemo(() => todayISO(), []);
  const daysCount = parseInt(horizon, 10);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (selectedRoomType === "all") return rooms;
    return rooms.filter((r) => r.type === selectedRoomType);
  }, [rooms, selectedRoomType]);

  const totalCapacity = filteredRooms.length;

  // 1. Time-series data for Occupancy & Demand Forecast
  const occupancyTimelineData = useMemo(() => {
    const data = [];
    const validReservations = reservations.filter((r) => r.status !== "cancelled");

    for (let i = 0; i < daysCount; i++) {
      const dateIso = addDaysISO(today, i);
      const dayDate = new Date(dateIso + "T00:00:00Z");
      const dayLabel = dayDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });

      // Count active occupied rooms on this date
      const occupiedReservations = validReservations.filter((res) => {
        const matchesRoom =
          selectedRoomType === "all" ||
          rooms.find((r) => r.id === res.roomId)?.type === selectedRoomType;
        return matchesRoom && res.checkIn <= dateIso && res.checkOut > dateIso;
      });

      const occupiedCount = occupiedReservations.length;
      const ratePct = totalCapacity > 0 ? Math.round((occupiedCount / totalCapacity) * 100) : 0;

      // Estimated daily revenue from occupied rooms in EUR
      const dailyRevEUR = occupiedReservations.reduce((sum, res) => {
        const room = rooms.find((r) => r.id === res.roomId);
        const rate = room ? ROOM_RATES_EUR[room.type] : 160;
        return sum + rate;
      }, 0);

      data.push({
        date: dateIso,
        displayDate: dayLabel,
        dayName: dayDate.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        occupied: occupiedCount,
        available: Math.max(0, totalCapacity - occupiedCount),
        occupancyRate: ratePct,
        revenue: convertFromEUR(dailyRevEUR),
        rawRevenueEUR: dailyRevEUR,
      });
    }
    return data;
  }, [daysCount, today, reservations, rooms, selectedRoomType, totalCapacity, convertFromEUR]);

  // High & Low occupancy days
  const peakDay = useMemo(() => {
    return [...occupancyTimelineData].sort((a, b) => b.occupancyRate - a.occupancyRate)[0];
  }, [occupancyTimelineData]);

  const lowDay = useMemo(() => {
    return [...occupancyTimelineData].sort((a, b) => a.occupancyRate - b.occupancyRate)[0];
  }, [occupancyTimelineData]);

  // Overall statistics for the selected horizon
  const avgOccupancy = useMemo(() => {
    if (!occupancyTimelineData.length) return 0;
    const totalPct = occupancyTimelineData.reduce((acc, curr) => acc + curr.occupancyRate, 0);
    return Math.round(totalPct / occupancyTimelineData.length);
  }, [occupancyTimelineData]);

  const totalProjectedRevenueEUR = useMemo(() => {
    return occupancyTimelineData.reduce((acc, curr) => acc + curr.rawRevenueEUR, 0);
  }, [occupancyTimelineData]);

  const adrEUR = useMemo(() => {
    const totalNights = occupancyTimelineData.reduce((acc, curr) => acc + curr.occupied, 0);
    if (!totalNights) return 185;
    return Math.round(totalProjectedRevenueEUR / totalNights);
  }, [totalProjectedRevenueEUR, occupancyTimelineData]);

  const revParEUR = useMemo(() => {
    if (!totalCapacity || !daysCount) return 0;
    return Math.round(totalProjectedRevenueEUR / (totalCapacity * daysCount));
  }, [totalProjectedRevenueEUR, totalCapacity, daysCount]);

  // 2. Room category performance data
  const categoryPerformance = useMemo(() => {
    const types: RoomType[] = ["standard", "deluxe", "family", "suite"];
    return types.map((type) => {
      const typeRooms = rooms.filter((r) => r.type === type);
      const typeReservations = reservations.filter((res) => {
        const room = rooms.find((r) => r.id === res.roomId);
        return room?.type === type && res.status !== "cancelled";
      });

      const totalNights = typeReservations.reduce((sum, res) => {
        return sum + Math.max(1, diffDays(res.checkOut, res.checkIn));
      }, 0);

      const rateEUR = ROOM_RATES_EUR[type];
      const revenueEUR = totalNights * rateEUR;

      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        rateLabel: formatCurrency(rateEUR),
        roomsCount: typeRooms.length,
        bookingsCount: typeReservations.length,
        totalNights,
        revenue: convertFromEUR(revenueEUR),
        rawRevenueEUR: revenueEUR,
        avgNights: typeReservations.length
          ? (totalNights / typeReservations.length).toFixed(1)
          : "0",
      };
    });
  }, [rooms, reservations, convertFromEUR, formatCurrency]);

  // 3. Booking pipeline status distribution
  const pipelineData = useMemo(() => {
    const counts: Record<string, number> = {
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      pending: 0,
      cancelled: 0,
    };

    reservations.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });

    const total = reservations.length || 1;

    return [
      {
        name: "Confirmed",
        value: counts.confirmed,
        pct: Math.round((counts.confirmed / total) * 100),
        fill: "var(--color-confirmed, #2563eb)",
      },
      {
        name: "In-House",
        value: counts.checked_in,
        pct: Math.round((counts.checked_in / total) * 100),
        fill: "var(--color-inhouse, #16a34a)",
      },
      {
        name: "Pending",
        value: counts.pending,
        pct: Math.round((counts.pending / total) * 100),
        fill: "var(--color-pending, #d97706)",
      },
      {
        name: "Checked Out",
        value: counts.checked_out,
        pct: Math.round((counts.checked_out / total) * 100),
        fill: "var(--color-departed, #64748b)",
      },
      {
        name: "Cancelled",
        value: counts.cancelled,
        pct: Math.round((counts.cancelled / total) * 100),
        fill: "var(--color-cancelled, #dc2626)",
      },
    ];
  }, [reservations]);

  const cancellationRate = useMemo(() => {
    const total = reservations.length || 1;
    const cancelled = reservations.filter((r) => r.status === "cancelled").length;
    return ((cancelled / total) * 100).toFixed(1);
  }, [reservations]);

  // Chart configuration for shadcn ChartContainer
  const occupancyChartConfig = {
    occupancyRate: {
      label: "Occupancy Rate (%)",
      color: "var(--color-primary)",
    },
    occupied: {
      label: "Occupied Rooms",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig;

  const revenueChartConfig = {
    revenue: {
      label: `Revenue (${currencySymbol})`,
      color: "var(--color-primary)",
    },
    totalNights: {
      label: "Room Nights",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig;

  const pipelineChartConfig = {
    confirmed: { label: "Confirmed", color: "var(--color-confirmed)" },
    inhouse: { label: "In-House", color: "var(--color-inhouse)" },
    pending: { label: "Pending", color: "var(--color-pending)" },
    departed: { label: "Checked Out", color: "var(--color-departed)" },
    cancelled: { label: "Cancelled", color: "var(--color-cancelled)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar with Currency, Horizon & Class Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Revenue & Demand Forecast
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Projected room occupancy and pricing performance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Currency:</span>
            <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <Coins className="mr-1.5 size-3.5 text-primary" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_LIST.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horizon select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Horizon:</span>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <Calendar className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7" className="text-xs">
                  Next 7 Days
                </SelectItem>
                <SelectItem value="14" className="text-xs">
                  Next 14 Days
                </SelectItem>
                <SelectItem value="30" className="text-xs">
                  Next 30 Days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Class:</span>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                <SelectItem value="standard" className="text-xs">
                  Standard Rooms
                </SelectItem>
                <SelectItem value="deluxe" className="text-xs">
                  Deluxe Rooms
                </SelectItem>
                <SelectItem value="suite" className="text-xs">
                  Penthouse Suites
                </SelectItem>
                <SelectItem value="family" className="text-xs">
                  Family Suites
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip with Dynamic Multi-Currency Display */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-xs font-medium text-muted-foreground">Projected Occupancy</span>
            <Percent className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tracking-tight tabular">{avgOccupancy}%</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="size-3" />
              <span>Target: 75% Breakeven</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {avgOccupancy >= 75 ? "Optimal capacity load." : "Midweek promotion recommended."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-xs font-medium text-muted-foreground">
              Projected Revenue ({currency})
            </span>
            <DollarSign className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tracking-tight tabular">
              {formatCurrency(totalProjectedRevenueEUR)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{daysCount}-day forecast</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Based on active reservations in {currency}.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-xs font-medium text-muted-foreground">
              Average Daily Rate (ADR)
            </span>
            <TrendingUp className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tracking-tight tabular">
              {formatCurrency(adrEUR)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span>Benchmark: {formatCurrency(175)}</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Revenue divided by occupied room nights.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-xs font-medium text-muted-foreground">RevPAR ({currency})</span>
            <Layers className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tracking-tight tabular">
              {formatCurrency(revParEUR)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>Revenue / Total Rooms</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Pricing power & capacity yield.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-xs font-medium text-muted-foreground">Cancellation Rate</span>
            <AlertCircle className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tracking-tight tabular">{cancellationRate}%</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              <span>Healthy (&lt;12%)</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Deposit guarantee compliance.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Section: Demand Forecast (Area Chart) */}
      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Occupancy Curve & Demand Velocity ({daysCount}-Day Window)
            </CardTitle>
            <CardDescription className="text-xs">
              Daily percentage of hotel capacity booked. Reference line marks the 75% boutique
              revenue target.
            </CardDescription>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            {peakDay && (
              <Badge variant="secondary" className="text-[11px]">
                Peak: {peakDay.dayName} ({peakDay.occupancyRate}%)
              </Badge>
            )}
            {lowDay && (
              <Badge variant="outline" className="text-[11px]">
                Low: {lowDay.dayName} ({lowDay.occupancyRate}%)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={occupancyChartConfig} className="h-[280px] w-full">
            <AreaChart
              data={occupancyTimelineData}
              margin={{ top: 12, right: 16, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px]"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
                tickMargin={4}
                className="text-[11px]"
              />
              <ReferenceLine
                y={75}
                stroke="var(--color-chart-2)"
                strokeDasharray="4 4"
                label={{
                  value: "75% Target",
                  fill: "var(--color-chart-2)",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="font-semibold text-foreground">
                          {item.payload.displayDate}
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Occupancy Rate:</span>
                          <span className="font-bold text-primary">
                            {item.payload.occupancyRate}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Occupied Rooms:</span>
                          <span>
                            {item.payload.occupied} / {totalCapacity}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Est. Daily Revenue:</span>
                          <span className="font-mono">
                            {formatCurrency(item.payload.rawRevenueEUR)}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="occupancyRate"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#fillOccupancy)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        {/* Data Meaning & UX Study Card */}
        <CardFooter className="flex flex-col items-start gap-2 border-t border-border/70 bg-muted/20 px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <span className="font-semibold text-foreground">Data Meaning & Strategy: </span>
              <span className="text-muted-foreground">
                Days exceeding 75% occupancy indicate pricing elasticity for premium rates. On dip
                days like {lowDay?.dayName} ({lowDay?.occupancyRate}%), front-desk should bundle
                dining or spa perks to bolster weekday bookings.
              </span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 bg-background text-[10px]">
            Action: Dynamic Pricing
          </Badge>
        </CardFooter>
      </Card>

      {/* Two-Column Grid: Revenue by Category & Pipeline Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 2: Revenue & Nights by Room Type (Bar Chart) */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Revenue Contribution by Room Category ({currency})
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimated revenue earned across all booked dates in each room class.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/40 text-[10px]">
                Yield Mix ({currency})
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <BarChart
                data={categoryPerformance}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />
                <XAxis dataKey="type" tickLine={false} axisLine={false} className="text-[11px]" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
                  className="text-[11px]"
                />
                <ChartTooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                  content={
                    <ChartTooltipContent
                      formatter={(val, name, item) => (
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-semibold">
                            {item.payload.type} ({item.payload.rateLabel}/night)
                          </span>
                          <span className="text-primary font-bold">
                            Total Revenue: {formatCurrency(item.payload.rawRevenueEUR)}
                          </span>
                          <span className="text-muted-foreground">
                            Booked Nights: {item.payload.totalNights} nights (
                            {item.payload.avgNights} avg stay)
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-1.5 border-t border-border/70 bg-muted/20 px-5 py-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>UX Study Insight:</span>
            </div>
            <p className="text-muted-foreground">
              Penthouse Suites yield high margins ({formatCurrency(330)}/night) despite fewer
              bookings. Recommend highlighting suite upgrades prominently in the reservation dialog
              to capture upselling opportunities.
            </p>
          </CardFooter>
        </Card>

        {/* Chart 3: Booking Status Pipeline (Donut / Pie Chart) */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Booking Status Lifecycle</CardTitle>
                <CardDescription className="text-xs">
                  Proportion of reservations by operational stage.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {reservations.length} Active Records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center justify-center sm:flex-row">
              <ChartContainer
                config={pipelineChartConfig}
                className="mx-auto h-[250px] w-full max-w-[280px]"
              >
                <PieChart>
                  <Pie
                    data={pipelineData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="var(--color-card)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val, name, item) => (
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-medium">{item.payload.name}:</span>
                            <span className="font-bold">
                              {item.payload.value} bookings ({item.payload.pct}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>

              <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:flex-col sm:gap-1.5">
                {pipelineData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground">{item.name}:</span>
                    <span className="font-semibold text-foreground">
                      {item.value} ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-1.5 border-t border-border/70 bg-muted/20 px-5 py-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <HelpCircle className="size-3.5 text-primary" />
              <span>Operational Guidance:</span>
            </div>
            <p className="text-muted-foreground">
              Pending confirmations should trigger automated follow-up 48 hours prior to arrival to
              minimize cancellation risk.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
