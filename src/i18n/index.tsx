import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { parseISODate } from "@/lib/dates";
import type { DateStyle } from "@/types";
import { en, type TranslationKey } from "./en";
import { tr } from "./tr";

export type Language = "en" | "tr";
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
];

const resources: Record<Language, Partial<Record<TranslationKey, string>>> = { en, tr };
const locales: Record<Language, string> = { en: "en-GB", tr: "tr-TR" };

type Vars = Record<string, string | number>;

interface I18n {
  lang: Language;
  locale: string;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
  formatDate: (iso: string, style?: DateStyle | "weekday" | "dayMonth") => string;
  formatNumber: (n: number, opts?: Intl.NumberFormatOptions) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({
  children,
  dateStyle,
}: {
  children: ReactNode;
  dateStyle: DateStyle;
}) {
  const [lang, setLang] = useState<Language>("en");
  const locale = locales[lang];

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      const template = resources[lang][key] ?? en[key] ?? key; // English fallback
      return vars
        ? template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
        : template;
    },
    [lang],
  );

  const formatDate = useCallback(
    (iso: string, style: DateStyle | "weekday" | "dayMonth" = dateStyle) => {
      const d = parseISODate(iso.slice(0, 10));
      let str = "";
      if (style === "weekday")
        str = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(d);
      else if (style === "dayMonth")
        str = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
      else str = new Intl.DateTimeFormat(locale, { dateStyle: style }).format(d);
      return str.replace(/[\u202F\u00A0]/g, " ");
    },
    [locale, dateStyle],
  );

  const formatNumber = useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, opts).format(n),
    [locale],
  );

  const value = useMemo(
    () => ({ lang, locale, setLang, t, formatDate, formatNumber }),
    [lang, locale, t, formatDate, formatNumber],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export type { TranslationKey };
