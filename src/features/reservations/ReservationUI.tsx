import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ReservationDetailSheet } from "./ReservationDetailSheet";
import { ReservationFormDialog, type ReservationPrefill } from "./ReservationFormDialog";

interface ReservationUI {
  openNew: (prefill?: ReservationPrefill) => void;
  openEdit: (id: string) => void;
  openDetail: (id: string) => void;
}

const Ctx = createContext<ReservationUI | null>(null);

/** Hosts the single reservation form and detail sheet so any page can open them. */
export function ReservationUIProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<{
    open: boolean;
    editId?: string | undefined;
    prefill?: ReservationPrefill | undefined;
  }>({ open: false });
  const [detailId, setDetailId] = useState<string>();

  const openNew = useCallback(
    (prefill?: ReservationPrefill) => setForm({ open: true, prefill }),
    [],
  );
  const openEdit = useCallback((id: string) => {
    setDetailId(undefined);
    setForm({ open: true, editId: id });
  }, []);
  const openDetail = useCallback((id: string) => setDetailId(id), []);
  const value = useMemo(() => ({ openNew, openEdit, openDetail }), [openNew, openEdit, openDetail]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ReservationFormDialog
        open={form.open}
        editId={form.editId}
        prefill={form.prefill}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
      />
      <ReservationDetailSheet
        id={detailId}
        onClose={() => setDetailId(undefined)}
        onEdit={openEdit}
      />
    </Ctx.Provider>
  );
}

export function useReservationUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReservationUI must be used inside ReservationUIProvider");
  return ctx;
}
