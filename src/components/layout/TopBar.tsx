import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Coins,
  Crown,
  Languages,
  Laptop,
  LogOut,
  Moon,
  Palette,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useReservationUI } from "@/features/reservations/ReservationUI";
import { LANGUAGES, useI18n, type Language } from "@/i18n";
import { todayISO } from "@/lib/dates";
import { useHotelData } from "@/mock/store";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { useCurrency, CURRENCY_LIST, type CurrencyCode } from "@/lib/currency";
import { navKeyForPath } from "./nav";
import { TopBarSearch } from "./TopBarSearch";
import { AccountDialog } from "./AccountDialog";

export function TopBar() {
  const { t, lang, setLang, formatDate } = useI18n();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { settings, staff, roles } = useHotelData();
  const { openNew } = useReservationUI();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [accountOpen, setAccountOpen] = useState(false);

  const me = staff[0] ?? {
    name: "Celine Laurent",
    roleId: "admin",
    email: "c.laurent@22boutique.com",
  };
  const myRole = roles.find((r) => r.id === me.roleId);

  const initials = me.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-[11px] leading-none text-muted-foreground">
            {settings.hotelName}
          </div>
          <div className="truncate text-sm font-semibold">{t(navKeyForPath(path))}</div>
        </div>

        {/* Dedicated live autocomplete search using shadcn UI */}
        <div
          className="mx-auto flex flex-1 items-center justify-center sm:mx-0 sm:justify-start sm:pl-3"
          suppressHydrationWarning
        >
          <TopBarSearch />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span
            className="hidden text-xs text-muted-foreground tabular xl:inline"
            suppressHydrationWarning
          >
            {formatDate(todayISO(), "long")}
          </span>

          {path !== "/settings" && path !== "/staff" && (
            <Button size="sm" onClick={() => openNew()} className="gap-1.5 shadow-xs">
              <Plus className="size-4" />
              <span className="hidden md:inline">{t("res.new")}</span>
            </Button>
          )}

          {/* Unified User Menu containing Account, Theme & Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-1"
                aria-label={me.name}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {/* Operator Details Header */}
              <DropdownMenuLabel className="pb-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">{me.name}</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {myRole?.name ?? "Administrator"}
                  </Badge>
                </div>
                <div className="text-xs font-normal text-muted-foreground truncate">
                  {me.email ?? "operator@22boutique.com"}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* 1. Account & Operator Profile */}
              <DropdownMenuItem
                onClick={() => setAccountOpen(true)}
                className="flex items-center gap-2 cursor-pointer py-1.5"
              >
                <User className="size-4 text-primary" />
                <span className="font-medium text-xs">Account & Profile</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* 2. Theme Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer py-1.5 text-xs">
                  <Palette className="size-4 text-primary" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40">
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(val) => setTheme(val as Theme)}
                  >
                    <DropdownMenuRadioItem
                      value="light"
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Sun className="size-3.5 text-amber-500" />
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="dark"
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Moon className="size-3.5 text-amber-300" />
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="system"
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Laptop className="size-3.5" />
                      <span>System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* 3. Language Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer py-1.5 text-xs">
                  <Languages className="size-4 text-primary" />
                  <span>Language</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36">
                  <DropdownMenuRadioGroup
                    value={lang}
                    onValueChange={(val) => setLang(val as Language)}
                  >
                    {LANGUAGES.map((l) => (
                      <DropdownMenuRadioItem
                        key={l.code}
                        value={l.code}
                        className="cursor-pointer text-xs"
                      >
                        {l.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* 4. Currency Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer py-1.5 text-xs">
                  <Coins className="size-4 text-primary" />
                  <span>Currency</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuRadioGroup
                    value={currency}
                    onValueChange={(val) => setCurrency(val as CurrencyCode)}
                  >
                    {CURRENCY_LIST.map((c) => (
                      <DropdownMenuRadioItem
                        key={c.code}
                        value={c.code}
                        className="cursor-pointer text-xs"
                      >
                        {c.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Navigation Shortcuts */}
              <DropdownMenuItem asChild className="py-1.5 text-xs">
                <Link to="/home" className="flex items-center gap-2">
                  <Crown className="size-4 text-amber-500" />
                  <span>{t("nav.home")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("replay-hotel-splash"));
                }}
                className="flex items-center gap-2 cursor-pointer py-1.5 text-xs"
              >
                <Sparkles className="size-4 text-amber-500" />
                <span>Preview Splash Screen</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="py-1.5 text-xs">
                <Link to="/staff" className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <span>{t("nav.staff")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="py-1.5 text-xs">
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  <span>{t("nav.settings")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Sign Out / Shift Handover */}
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Session locked", {
                    description: `Shift handover registered for ${me.name}.`,
                  });
                }}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer py-1.5 text-xs"
              >
                <LogOut className="size-4" />
                <span>Sign Out / Handover</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Account Dialog */}
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
