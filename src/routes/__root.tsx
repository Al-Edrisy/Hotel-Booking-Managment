import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { HotelDataProvider, useHotelData } from "@/mock/store";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CurrencyProvider } from "@/lib/currency";
import { I18nProvider } from "@/i18n";
import { ReservationUIProvider } from "@/features/reservations/ReservationUI";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/brand/SplashScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/home"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Home & Showcase
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Front Desk
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "22 Boutique Hotel — Operations" },
      {
        name: "description",
        content:
          "Luxury hospitality operations and reservation management system for 22 Boutique Hotel.",
      },
      { name: "author", content: "22 Boutique Hotel" },
      { property: "og:title", content: "22 Boutique Hotel — Operations" },
      {
        property: "og:description",
        content:
          "Luxury hospitality operations and reservation management system for 22 Boutique Hotel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono&display=swap"
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <HotelDataProvider>
          <CurrencyProvider>
            <Shell />
          </CurrencyProvider>
        </HotelDataProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function Shell() {
  const { settings } = useHotelData();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only check sessionStorage once client has hydrated
    const hasShown = sessionStorage.getItem("hotel_splash_shown");
    if (!hasShown) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset["accent"] = settings.accentColor;
  }, [settings.accentColor]);

  // Listen for custom trigger to replay splash
  useEffect(() => {
    const handleReplay = () => setShowSplash(true);
    window.addEventListener("replay-hotel-splash", handleReplay);
    return () => window.removeEventListener("replay-hotel-splash", handleReplay);
  }, []);

  const handleSplashComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hotel_splash_shown", "true");
    }
    setShowSplash(false);
  };

  return (
    <I18nProvider dateStyle={settings.dateStyle}>
      <ReservationUIProvider>
        <SidebarProvider>
          {showSplash && (
            <SplashScreen hotelName={settings.hotelName} onComplete={handleSplashComplete} />
          )}
          <div className="flex min-h-screen w-full" suppressHydrationWarning>
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 sm:px-6 py-4 sm:py-6">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ReservationUIProvider>
      <Toaster position="bottom-right" />
    </I18nProvider>
  );
}
