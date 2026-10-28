import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Check, Moon, Palette, RotateCcw, Sun, Laptop, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { LuxuryHotelCrest } from "@/components/brand/LuxuryHotelCrest";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useHotelData } from "@/mock/store";
import type { AccentColor, DateStyle } from "@/types";

export const Route = createFileRoute("/settings")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Settings — 22 Boutique Hotel" },
      { name: "description", content: "Settings for 22 Boutique Hotel operations." },
      { property: "og:title", content: "Settings — 22 Boutique Hotel" },
      { property: "og:description", content: "Settings for 22 Boutique Hotel operations." },
    ],
  }),
  component: Page,
});

const ACCENTS: { key: AccentColor; label: string; color: string }[] = [
  { key: "forest", label: "Emerald / Gold", color: "bg-emerald-600" },
  { key: "navy", label: "Midnight Navy", color: "bg-blue-700" },
  { key: "terracotta", label: "Warm Terracotta", color: "bg-amber-700" },
  { key: "plum", label: "Royal Plum", color: "bg-purple-800" },
  { key: "charcoal", label: "Obsidian Charcoal", color: "bg-neutral-800" },
];

function Page() {
  const { t } = useI18n();
  const { settings, saveSettings } = useHotelData();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [form, setForm] = useState({ ...settings });
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(form);
    setDirty(false);
    toast.success("Settings saved successfully", {
      description: "22 Boutique Hotel configuration updated.",
    });
  };

  const handleReset = () => {
    setForm({ ...settings });
    setDirty(false);
    toast.info("Changes reverted to current settings.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.settings")}
        subtitle="Manage 22 Boutique Hotel branding, theme appearance, and operational defaults."
      />

      <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
        {/* Luxury Brand & Emblem */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <CardTitle className="text-base font-semibold">Brand & Luxury Emblem</CardTitle>
            </div>
            <CardDescription>Official identity and crest for 22 Boutique Hotel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border/80 bg-muted/30 p-4">
              <LuxuryHotelCrest size={64} />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
                    22 Boutique Hotel
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]"
                  >
                    Official Crest
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Classic European luxury gold crest with engraved &apos;22&apos; monogram and
                  double-ring laurel filigree.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input
                id="hotelName"
                value={form.hotelName}
                onChange={(e) => update("hotelName", e.target.value)}
                placeholder="22 Boutique Hotel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorLabel">Operator / Management Label</Label>
              <Input
                id="operatorLabel"
                value={form.operatorLabel}
                onChange={(e) => update("operatorLabel", e.target.value)}
                placeholder="Operated by SevenA Hospitality"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme & Visual Appearance */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Theme & Appearance</CardTitle>
            </div>
            <CardDescription>
              Configure dark/light presentation and palette styling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Theme switcher */}
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  className="h-10 justify-start gap-2 text-xs"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-4 text-amber-500" />
                  <span>Light</span>
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  className="h-10 justify-start gap-2 text-xs"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-4 text-amber-300" />
                  <span>Dark</span>
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  className="h-10 justify-start gap-2 text-xs"
                  onClick={() => setTheme("system")}
                >
                  <Laptop className="size-4" />
                  <span>System ({resolvedTheme})</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Accent color picker */}
            <div className="space-y-2">
              <Label>Accent Palette</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.key}
                    type="button"
                    onClick={() => update("accentColor", accent.key)}
                    className={`flex items-center gap-2 rounded-md border p-2 text-left text-xs transition-colors ${
                      form.accentColor === accent.key
                        ? "border-primary bg-primary/10 font-medium text-foreground ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className={`size-3.5 rounded-full ${accent.color}`} />
                    <span className="truncate">{accent.label}</span>
                    {form.accentColor === accent.key && (
                      <Check className="ml-auto size-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Compact tables switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compactTables" className="text-xs font-medium">
                  Compact Data Tables
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Reduce row padding for high-density reservation review.
                </p>
              </div>
              <Switch
                id="compactTables"
                checked={form.compactTables}
                onCheckedChange={(c) => update("compactTables", c)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotel Contact & Location */}
        <Card className="border-border md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Contact & Regional Settings</CardTitle>
            </div>
            <CardDescription>
              Reception contacts and timezone information displayed on guest itineraries.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email">Front Desk Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Reception Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2 md:col-span-1">
              <Label htmlFor="timeZone">Hotel Time Zone</Label>
              <Input
                id="timeZone"
                value={form.timeZone}
                onChange={(e) => update("timeZone", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2 md:col-span-1">
              <Label htmlFor="dateStyle">Date Display Style</Label>
              <Select
                value={form.dateStyle}
                onValueChange={(v) => update("dateStyle", v as DateStyle)}
              >
                <SelectTrigger id="dateStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (e.g. 26/10/26)</SelectItem>
                  <SelectItem value="medium">Medium (e.g. Oct 26, 2026)</SelectItem>
                  <SelectItem value="long">Long (e.g. Monday, October 26, 2026)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border/80 px-6 py-3">
            {dirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Revert
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!dirty} className="gap-1.5 shadow-sm">
              <Check className="size-4" /> Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
