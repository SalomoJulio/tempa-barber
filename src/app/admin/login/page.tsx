import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/tempa-admin/auth";
import Brand from "@/components/admin/Brand";
import LoginForm from "@/components/admin/LoginForm";

async function LoginContent() {
  await connection();
  if (await getAdmin()) redirect("/admin");
  return <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_25%,#304858_0%,transparent_65%)]" />
    <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-40 -z-10 h-120 w-120 rounded-full border border-accent/15" />
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-7 lg:px-12"><Brand /><Link href="/" className="text-xs text-muted hover:text-accent">Kembali ke website ↗</Link></header>
    <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-10 md:grid-cols-2 lg:gap-24 lg:px-12">
      <div><p className="text-[10px] uppercase tracking-[0.25em] text-accent">Behind every great cut</p>
        <h1 className="mt-6 text-5xl font-normal leading-tight tracking-tight lg:text-7xl">Detail terjaga.<span className="mt-1 block font-serif italic text-accent">Operasional tertata.</span></h1>
        <p className="mt-7 max-w-sm text-sm leading-7 text-muted">Satu ruang untuk mengatur kunjungan, menjaga jadwal, dan memberi perhatian pada setiap pelanggan.</p>
        <div className="mt-10 flex items-center gap-5"><div aria-hidden="true" className="relative h-16 w-24"><span className="absolute h-16 w-16 rounded-full border border-accent/50" /><span className="absolute left-7 h-16 w-16 rounded-full border border-accent/40 bg-accent/10" /></div><p className="text-xs leading-6 text-muted">Personal approach.<br />Precision in every detail.</p></div>
      </div>
      <div className="relative mx-auto w-full max-w-md"><div aria-hidden="true" className="absolute -bottom-3 left-4 right-4 top-4 rounded-bl-3xl rounded-tr-3xl border border-accent/25" />
        <div className="relative rounded-bl-3xl rounded-tr-3xl border border-foreground/15 bg-[linear-gradient(145deg,#304858,#223343_60%,#1b2c39)] p-7 sm:p-10">
          <p className="text-[9px] uppercase tracking-[0.2em] text-accent">TEMPA / Workspace</p><h2 className="mt-5 text-3xl tracking-tight">Selamat datang kembali.</h2><p className="mt-3 text-sm leading-6 text-muted">Masuk untuk mengelola kunjungan berikutnya.</p><LoginForm />
        </div>
      </div>
    </div><footer className="px-6 py-7 text-center text-[10px] uppercase tracking-[0.2em] text-muted">TEMPA Barber &amp; Grooming · Admin workspace</footer>
  </main>;
}

export default function LoginPage() {
  return <Suspense fallback={<p className="p-8 text-muted">Memeriksa sesi…</p>}><LoginContent /></Suspense>;
}
