"use client";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" });
  const [visible, setVisible] = useState(false);
  const field = "mt-2 min-h-12 w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted/50";
  return <form action={action} className="mt-8 space-y-5">
    <fieldset disabled={pending} className="min-w-0 space-y-5">
      <div><label htmlFor="admin-email" className="text-xs text-muted">Email admin</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} placeholder="Email akun admin" className={field} />
      </div>
      <div><label htmlFor="admin-password" className="text-xs text-muted">Password</label>
        <div className="relative"><input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required maxLength={256} className={`${field} pr-24`} />
          <button type="button" aria-controls="admin-password" aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute bottom-0 right-2 min-h-12 px-2 text-xs text-accent">{visible ? "Sembunyikan" : "Lihat"}</button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-between rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:opacity-50">
        {pending ? "Memeriksa akses…" : "Masuk ke dashboard"}<span aria-hidden="true">↗</span>
      </button>
    </fieldset>
    <div role="status" aria-live="polite">{state.error && <p className="rounded-xl border border-accent/30 bg-background/40 p-4 text-sm leading-6 text-accent">{state.error}</p>}</div>
    <p className="text-xs leading-6 text-muted">Akses khusus pengelola TEMPA. Sesi berakhir maksimal satu jam; masuk kembali untuk melanjutkan.</p>
  </form>;
}
