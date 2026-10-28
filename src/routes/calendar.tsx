import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarMatrix } from "@/components/calendar/CalendarMatrix";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/calendar")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Calendar — 22 Boutique Hotel" },
      { name: "description", content: "Calendar for 22 Boutique Hotel operations." },
      { property: "og:title", content: "Calendar — 22 Boutique Hotel" },
      { property: "og:description", content: "Calendar for 22 Boutique Hotel operations." },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.calendar")} subtitle={t("cal.subtitle")} />
      <CalendarMatrix />
    </div>
  );
}
