import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/tempa-admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  allowedActions,
  statusLabels,
  rupiah,
  visitDate,
  visitTime,
} from "@/lib/tempa-admin/presentation";

import Brand from "@/components/admin/Brand";
import StatusAction from "@/components/admin/StatusAction";

import { logoutAdmin } from "./actions";

type Params = Promise<{
  status?: string | string[];
  page?: string | string[];
}>;

const pageSize = 20;

function relationName(value: unknown) {
  const row = Array.isArray(value) ? value[0] : value;

  if (typeof row !== "object" || row === null) {
    return "—";
  }

  const name = (row as Record<string, unknown>).name;

  return typeof name === "string" ? name : "—";
}

function pageLink(status: string, page: number) {
  const params = new URLSearchParams({
    status,
    page: String(page),
  });

  return `/admin?${params.toString()}`;
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Params;
}) {
  await connection();

  const admin = await requireAdmin();
  const params = await searchParams;

  const filter =
    typeof params.status === "string" &&
    Object.hasOwn(statusLabels, params.status)
      ? params.status
      : "all";

  const page = Math.min(
    500,
    Math.max(
      1,
      Number.parseInt(
        typeof params.page === "string" ? params.page : "1",
        10,
      ) || 1,
    ),
  );

  const db = createAdminClient();

  let query = db.from("bookings").select(
    `
      id,
      booking_code,
      customer_name,
      customer_phone,
      starts_at,
      ends_at,
      price_idr,
      status,
      created_at,
      service:services(name),
      barber:barbers(name)
    `,
    { count: "exact" },
  );

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const [result, total, pending, confirmed, completed] =
    await Promise.all([
      query
        .order("starts_at", { ascending: false })
        .order("id", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1),

      db
        .from("bookings")
        .select("id", { count: "exact", head: true }),

      db
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      db
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed"),

      db
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
    ]);

  const failed = [
    result,
    total,
    pending,
    confirmed,
    completed,
  ].some((item) => item.error);

  const stats = [
    [
      "Seluruh booking",
      total.count,
      "Semua kunjungan tercatat",
    ],
    [
      "Menunggu",
      pending.count,
      "Perlu ditinjau dan dikonfirmasi",
    ],
    [
      "Dikonfirmasi",
      confirmed.count,
      "Kunjungan yang telah disetujui",
    ],
    [
      "Selesai",
      completed.count,
      "Layanan yang sudah dituntaskan",
    ],
  ] as const;

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* Gradasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_5%,#304858_0%,transparent_55%)]"
      />

      {/* Header */}
      <header className="border-b border-foreground/10 bg-background/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5 lg:px-12">
          <Brand />

          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-xs text-muted transition-colors hover:text-accent"
            >
              Lihat website ↗
            </Link>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="min-h-11 rounded-full border border-accent/40 px-5 text-xs text-accent transition-colors hover:bg-accent hover:text-background"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        {/* Judul */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              TEMPA / Admin workspace
            </p>

            <h1 className="mt-4 text-4xl font-normal tracking-tight sm:text-5xl">
              Setiap kunjungan,
              <span className="block font-serif italic text-accent">
                tertata dengan baik.
              </span>
            </h1>
          </div>

          <div className="max-w-full text-xs leading-6 text-muted">
            <p className="break-all">
              Masuk sebagai {admin.email}
            </p>

            <p>Seluruh waktu ditampilkan dalam WIB.</p>
          </div>
        </div>

        {/* Statistik */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, count, note], index) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-2xl border p-6 ${
                index === 1
                  ? "border-accent bg-accent text-background"
                  : "border-foreground/15 bg-surface/60"
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute -right-7 -top-7 h-24 w-24 rounded-full border border-current opacity-10"
              />

              <p
                className={`text-[10px] uppercase tracking-[0.15em] ${
                  index === 1
                    ? "text-background/70"
                    : "text-muted"
                }`}
              >
                {label}
              </p>

              <p className="mt-4 text-4xl tracking-tight">
                {failed ? "—" : count ?? 0}
              </p>

              <p
                className={`mt-3 text-xs leading-5 ${
                  index === 1
                    ? "text-background/70"
                    : "text-muted"
                }`}
              >
                {note}
              </p>
            </div>
          ))}
        </div>

        {/* Daftar booking */}
        <section
          aria-labelledby="bookings-heading"
          className="mt-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="bookings-heading"
                className="text-2xl"
              >
                Daftar kunjungan
              </h2>

              <p className="mt-2 text-xs leading-6 text-muted">
                Tanggal kunjungan terbaru di atas. Tinjau
                setiap permintaan sebelum mengonfirmasi.
              </p>
            </div>

            {/* Muat ulang memang meminta dokumen terbaru */}
            <a
              href={pageLink(filter, page)}
              className="inline-flex min-h-11 items-center rounded-full border border-accent/30 px-5 text-xs text-accent transition-colors hover:bg-accent/10"
            >
              Muat ulang ↻
            </a>
          </div>

          {/* Filter tanpa reload penuh */}
          <nav
            aria-label="Filter status booking"
            className="my-6 flex flex-wrap gap-2"
          >
            {[
              ["all", "Semua"],
              ...Object.entries(statusLabels),
            ].map(([value, label]) => (
              <Link
                key={value}
                href={pageLink(value, 1)}
                scroll={false}
                prefetch={false}
                aria-current={
                  filter === value ? "page" : undefined
                }
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-xs transition-colors duration-200 ${
                  filter === value
                    ? "border-accent bg-accent text-background"
                    : "border-foreground/15 text-muted hover:border-accent/50 hover:text-accent"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Gagal memuat */}
          {failed ? (
            <p
              role="alert"
              className="rounded-2xl border border-accent/30 p-6 text-sm leading-7 text-accent"
            >
              Data belum dapat dimuat. Periksa koneksi
              dan konfigurasi database, lalu muat ulang.
            </p>
          ) : result.data?.length === 0 ? (
            /* Tidak ada data */
            <div className="rounded-2xl border border-dashed border-accent/30 px-6 py-16 text-center">
              <p className="font-serif text-3xl italic text-accent">
                Ruang untuk kunjungan berikutnya.
              </p>

              <p className="mt-3 text-sm leading-6 text-muted">
                Belum ada booking pada filter atau halaman ini.
              </p>
            </div>
          ) : (
            /* Kartu booking */
            <div className="space-y-4">
              {result.data?.map((booking) => (
                <article
                  key={`${booking.id}:${booking.status}`}
                  className="overflow-hidden rounded-2xl border border-foreground/15 bg-[linear-gradient(145deg,rgba(48,72,88,0.55),rgba(27,44,57,0.85))]"
                >
                  <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr_1fr] lg:p-7">
                    {/* Pelanggan */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="wrap-break-word text-xl">
                          {booking.customer_name}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] ${
                            booking.status === "pending"
                              ? "border-accent/50 bg-accent/10 text-accent"
                              : "border-foreground/20 text-muted"
                          }`}
                        >
                          {statusLabels[booking.status] ??
                            booking.status}
                        </span>
                      </div>

                      <p className="mt-3 break-all text-sm text-muted">
                        +{booking.customer_phone}
                      </p>

                      <p className="mt-4 text-[9px] uppercase tracking-[0.15em] text-muted">
                        Kode booking
                      </p>

                      <p className="mt-1 break-all font-mono text-[11px] leading-5 text-foreground/75">
                        {booking.booking_code}
                      </p>
                    </div>

                    {/* Waktu dan layanan */}
                    <div className="min-w-0 border-t border-foreground/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="text-xs text-accent">
                        {visitDate(booking.starts_at)}
                      </p>

                      <p className="mt-2 text-xl">
                        {visitTime(booking.starts_at)}–
                        {visitTime(booking.ends_at)}{" "}
                        <span className="text-xs text-muted">
                          WIB
                        </span>
                      </p>

                      <p className="mt-3 text-sm">
                        {relationName(booking.service)}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Barber: {relationName(booking.barber)}
                      </p>
                    </div>

                    {/* Harga dan aksi */}
                    <div className="min-w-0 border-t border-foreground/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-muted">
                        Harga booking
                      </p>

                      <p className="mt-2 text-2xl text-accent">
                        {rupiah(booking.price_idr)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-start gap-2">
                        {allowedActions(booking.status).map(
                          (status) => (
                            <StatusAction
                              key={status}
                              id={booking.id}
                              status={status}
                            />
                          ),
                        )}
                      </div>

                      {allowedActions(booking.status).length ===
                        0 && (
                        <p className="mt-4 text-xs leading-5 text-muted">
                          Status akhir. Tidak ada perubahan
                          lanjutan.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination tanpa reload penuh */}
          {!failed && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-5 text-xs text-muted">
              <p>
                {result.count ?? 0} booking · Halaman {page} ·
                Maksimal {pageSize} per halaman
              </p>

              <div className="flex gap-4">
                {page > 1 && (
                  <Link
                    href={pageLink(filter, page - 1)}
                    scroll={false}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center text-accent"
                  >
                    ← Sebelumnya
                  </Link>
                )}

                {page < 500 &&
                  page * pageSize < (result.count ?? 0) && (
                    <Link
                      href={pageLink(filter, page + 1)}
                      scroll={false}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center text-accent"
                    >
                      Berikutnya →
                    </Link>
                  )}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-12 text-[10px] uppercase tracking-[0.2em] text-muted">
          TEMPA · Precision in every detail
        </footer>
      </div>
    </main>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-muted">
          Memeriksa akses dan memuat dashboard…
        </p>
      }
    >
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}