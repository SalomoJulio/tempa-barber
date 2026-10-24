"use client";
import { useActionState, useState } from "react";
import { changeBookingStatus } from "@/app/admin/actions";

const labels: Record<string, string> = {
  confirmed: "Konfirmasi", cancelled: "Batalkan", completed: "Selesai", no_show: "Tidak hadir",
};

export default function StatusAction({ id, status }: { id: string; status: string }) {
  const [armed, setArmed] = useState(false);
  const [state, action, pending] = useActionState(changeBookingStatus.bind(null, id, status), { error: "" });
  const danger = status === "cancelled" || status === "no_show";
  return <div className="max-w-xs">
    {!armed ? <button type="button" onClick={() => setArmed(true)} className={`min-h-11 rounded-full px-4 py-2 text-xs ${danger ? "border border-foreground/20 text-muted hover:text-foreground" : "bg-accent text-background hover:bg-foreground"}`}>{labels[status]}</button>
      : <form action={action} className="rounded-xl border border-accent/25 p-3">
        <p className="mb-2 text-xs leading-5 text-muted">{status === "cancelled" ? "Batalkan booking? Slot akan tersedia kembali." : `Ubah menjadi ${labels[status].toLowerCase()}?`}</p>
        <div className="flex flex-wrap gap-2"><button type="submit" disabled={pending} className="min-h-11 rounded-full bg-accent px-4 py-2 text-xs text-background disabled:opacity-50">{pending ? "Menyimpan…" : "Ya, lanjutkan"}</button>
          <button type="button" disabled={pending} onClick={() => setArmed(false)} className="min-h-11 px-3 text-xs text-muted">Kembali</button></div>
        <div role="status">{state.error && <p className="mt-2 text-xs leading-5 text-accent">{state.error}</p>}</div>
      </form>}
  </div>;
}
