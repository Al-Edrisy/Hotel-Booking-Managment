import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "TRY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // conversion from EUR
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "Euro (€ EUR)",
    rate: 1.0,
    locale: "de-DE",
  },
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar ($ USD)",
    rate: 1.09,
    locale: "en-US",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "British Pound (£ GBP)",
    rate: 0.85,
    locale: "en-GB",
  },
  TRY: {
    code: "TRY",
    symbol: "₺",
    label: "Turkish Lira (₺ TRY)",
    rate: 38.5,
    locale: "tr-TR",
  },
};

export const CURRENCY_LIST: CurrencyConfig[] = Object.values(CURRENCIES);

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  currencySymbol: string;
  formatCurrency: (amountInEUR: number, opts?: { hideDecimals?: boolean }) => string;
  convertFromEUR: (amountInEUR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = "stayflow_currency_preference";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Initialize to "EUR" identically on both server and client to avoid SSR hydration mismatch
  const [currency, setCurrencyState] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      if (stored && CURRENCIES[stored]) {
        setCurrencyState(stored);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // Storage unavailable fallback
    }
  };

  const currentConfig = CURRENCIES[currency] || CURRENCIES.EUR;

  const convertFromEUR = (amountInEUR: number) => {
    return Math.round(amountInEUR * currentConfig.rate);
  };

  const formatCurrency = (
    amountInEUR: number,
    opts?: { hideDecimals?: boolean; currency?: CurrencyCode },
  ): string => {
    const currencyToUse = opts?.currency ?? currency;
    const config = CURRENCIES[currencyToUse];
    const converted = amountInEUR * config.rate;
    const hideDecimals =
      opts?.hideDecimals ?? (currencyToUse === "TRY" || Math.abs(converted) >= 100);

    const formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: hideDecimals ? 0 : 2,
      maximumFractionDigits: hideDecimals ? 0 : 2,
    }).format(converted);

    // Format with appropriate symbol positioning
    if (currencyToUse === "USD") return `$${formattedNumber}`;
    if (currencyToUse === "GBP") return `£${formattedNumber}`;
    if (currencyToUse === "TRY") return `₺${formattedNumber}`;
    return `€${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyConfig: currentConfig,
        currencySymbol: currentConfig.symbol,
        formatCurrency,
        convertFromEUR,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
