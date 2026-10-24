"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type Service = {
  id: string;
  name: string;
  price_idr: number;
  duration_minutes: number;
};

type Slot = {
  time: string;
  startsAt: string;
  endsAt: string;
};

type Availability = {
  key: string;
  slots: Slot[];
  barber: string;
  message: string;
  error: boolean;
};

type Review = {
  name: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  date: string;
  slot: Slot;
  barber: string;
};

type BookingPayload = {
  requestId: string;
  name: string;
  phone: string;
  serviceId: string;
  startsAt: string;
};

type Receipt = {
  bookingCode: string;
  status: string;
  startsAt: string;
  endsAt: string;
  priceIdr: number;
};

type Phase = "editing" | "review" | "sending" | "uncertain" | "done";

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateInJakarta(timestamp: number, offset = 0) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  const date = new Date(
    `${part("year")}-${part("month")}-${part("day")}T12:00:00Z`,
  );

  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function displayDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

function normalizePhone(value: string) {
  if (!/^[+0-9()\s-]+$/.test(value.trim())) return "";

  let phone = value.trim().replace(/[\s()-]/g, "");

  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) phone = `62${phone.slice(1)}`;

  return /^628[0-9]{7,12}$/.test(phone) ? phone : "";
}

function isService(value: unknown): value is Service {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price_idr === "number" &&
    Number.isInteger(item.price_idr) &&
    item.price_idr >= 0 &&
    typeof item.duration_minutes === "number" &&
    Number.isInteger(item.duration_minutes) &&
    item.duration_minutes > 0
  );
}

function isSlot(value: unknown): value is Slot {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.time === "string" &&
    typeof item.startsAt === "string" &&
    typeof item.endsAt === "string" &&
    Number.isFinite(Date.parse(item.startsAt)) &&
    Number.isFinite(Date.parse(item.endsAt)) &&
    Date.parse(item.endsAt) > Date.parse(item.startsAt)
  );
}

function isReceipt(value: unknown): value is Receipt {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.bookingCode === "string" &&
    /^[0-9a-f-]{36}$/i.test(item.bookingCode) &&
    typeof item.status === "string" &&
    typeof item.startsAt === "string" &&
    Number.isFinite(Date.parse(item.startsAt)) &&
    typeof item.endsAt === "string" &&
    Number.isFinite(Date.parse(item.endsAt)) &&
    typeof item.priceIdr === "number" &&
    Number.isFinite(item.priceIdr)
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu konfirmasi",
    confirmed: "Dikonfirmasi",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    no_show: "Tidak hadir",
  };

  return labels[status] ?? status;
}

// Dipanggil saat pengguna mengonfirmasi, bukan saat render.
async function preparePayload(review: Review): Promise<BookingPayload> {
  return {
    requestId: crypto.randomUUID(),
    name: review.name,
    phone: review.phone,
    serviceId: review.serviceId,
    startsAt: review.slot.startsAt,
  };
}

export default function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [servicesRetry, setServicesRetry] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const [availability, setAvailability] =
    useState<Availability | null>(null);
  const [scheduleRetry, setScheduleRetry] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [phase, setPhase] = useState<Phase>("editing");
  const [review, setReview] = useState<Review | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [message, setMessage] = useState("");

  const pendingRequest = useRef<BookingPayload | null>(null);
  const sendingLock = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const service = services.find((item) => item.id === serviceId);
  const scheduleKey =
    serviceId && date ? `${serviceId}:${date}:${scheduleRetry}` : "";

  const schedule =
    scheduleKey && availability?.key === scheduleKey
      ? availability
      : null;

  const scheduleLoading = Boolean(scheduleKey) && !schedule;

  const slots =
    schedule?.slots.filter(
      (slot) =>
        currentTime > 0 && Date.parse(slot.startsAt) > currentTime,
    ) ?? [];

  const slot = slots.find((item) => item.startsAt === startsAt);

  const locked =
    phase === "sending" || phase === "uncertain" || phase === "done";

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (
          !response.ok ||
          result.success !== true ||
          !Array.isArray(result.services) ||
          !result.services.every(isService)
        ) {
          throw new Error();
        }

        if (!controller.signal.aborted) {
          setServices(result.services);
          setServicesLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setServicesError("Layanan belum dapat dimuat.");
          setServicesLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [servicesRetry]);

  useEffect(() => {
    if (!serviceId || !date) return;

    const controller = new AbortController();
    const key = `${serviceId}:${date}:${scheduleRetry}`;

    async function load() {
      try {
        const params = new URLSearchParams({ serviceId, date });
        const response = await fetch(`/api/availability?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            response.status === 400 &&
              typeof result.message === "string"
              ? result.message
              : "Jadwal belum dapat dimuat.",
          );
        }

        if (
          !Array.isArray(result.slots) ||
          !result.slots.every(isSlot) ||
          typeof result.barber?.name !== "string"
        ) {
          throw new Error("Respons jadwal tidak valid.");
        }

        if (!controller.signal.aborted) {
          setAvailability({
            key,
            slots: result.slots,
            barber: result.barber.name,
            message:
              typeof result.message === "string"
                ? result.message
                : "Pilih waktu yang tersedia.",
            error: false,
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailability({
            key,
            slots: [],
            barber: "",
            message:
              error instanceof Error
                ? error.message
                : "Jadwal belum dapat dimuat.",
            error: true,
          });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [serviceId, date, scheduleRetry]);

  function clearReview() {
    setReview(null);
    setMessage("");
    setPhase("editing");
  }

  function refreshSchedule() {
    setStartsAt("");
    clearReview();
    setScheduleRetry((previous) => previous + 1);
  }

  function retryServices() {
    setServicesLoading(true);
    setServicesError("");
    setServiceId("");
    setStartsAt("");
    clearReview();
    setServicesRetry((previous) => previous + 1);
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (locked) return;

    setMessage("");

    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName || [...cleanName].length > 60) {
      setMessage("Masukkan nama dengan panjang 1–60 karakter.");
      return;
    }

    if (!cleanPhone) {
      setMessage("Masukkan nomor WhatsApp Indonesia yang valid.");
      return;
    }

    if (
      currentTime === 0 ||
      !service ||
      !slot ||
      !schedule ||
      schedule.error
    ) {
      setMessage("Pilih layanan, tanggal, dan jam yang tersedia.");
      return;
    }

    if (
      date < dateInJakarta(currentTime) ||
      date > dateInJakarta(currentTime, 60)
    ) {
      setMessage("Pilih tanggal hari ini hingga 60 hari ke depan.");
      return;
    }

    setReview({
      name: cleanName,
      phone: cleanPhone,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price_idr,
      duration: service.duration_minutes,
      date,
      slot,
      barber: schedule.barber,
    });

    setPhase("review");
  }

  async function sendBooking() {
    if (
      sendingLock.current ||
      !review ||
      (phase !== "review" && phase !== "uncertain")
    ) {
      return;
    }

    sendingLock.current = true;
    setPhase("sending");
    setMessage("");

    try {
      // Saat mencoba ulang, payload dan ID tetap sama.
      if (!pendingRequest.current) {
        pendingRequest.current = await preparePayload(review);
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingRequest.current),
      });

      const result = await response.json();

      if (
        response.ok &&
        result.success === true &&
        isReceipt(result.booking)
      ) {
        setReceipt(result.booking);
        setPhase("done");
        pendingRequest.current = null;
        return;
      }

      const errorMessage =
        typeof result.message === "string"
          ? result.message
          : "Booking belum dapat diproses.";

      // Respons ini berarti permintaan ditolak.
      if ([400, 403, 409, 413, 415].includes(response.status)) {
        pendingRequest.current = null;
        setReview(null);
        setPhase("editing");
        setMessage(errorMessage);

        if (response.status === 409) {
          setStartsAt("");
          setScheduleRetry((previous) => previous + 1);
        }

        return;
      }

      // Network/503 bisa terjadi setelah database menyimpan booking.
      // Pertahankan ID untuk memeriksa hasil lewat pengiriman ulang.
      setPhase("uncertain");
      setMessage(
        response.status === 429
          ? `${errorMessage} Tunggu 10 menit sebelum mencoba ulang.`
          : `${errorMessage} Gunakan tombol Coba kirim ulang.`,
      );
    } catch {
      setPhase("uncertain");
      setMessage(
        "Koneksi terputus atau respons belum terbaca. Hasil penyimpanan belum dapat dipastikan. Gunakan Coba kirim ulang tanpa mengubah isian.",
      );
    } finally {
      sendingLock.current = false;
    }
  }

  function startNewBooking() {
    pendingRequest.current = null;
    setReceipt(null);
    setReview(null);
    setName("");
    setPhone("");
    setServiceId("");
    setDate("");
    setStartsAt("");
    setMessage("");
    setPhase("editing");
    setScheduleRetry((previous) => previous + 1);
  }

  const fieldClass =
    "mt-2 min-h-12 w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 text-sm text-foreground focus:border-accent disabled:cursor-not-allowed disabled:opacity-50";

  const canReview =
    currentTime > 0 &&
    Boolean(service && slot) &&
    !servicesLoading &&
    !scheduleLoading &&
    !schedule?.error;

  const scheduleMessage = !scheduleKey
    ? "Pilih layanan dan tanggal untuk melihat jadwal."
    : scheduleLoading
      ? "Sedang memeriksa jadwal..."
      : schedule?.error
        ? schedule.message
        : slots.length === 0 && (schedule?.slots.length ?? 0) > 0
          ? "Waktu yang dimuat sudah lewat. Pilih tanggal lain."
          : schedule?.message ?? "";

  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="relative isolate overflow-hidden border-t border-foreground/10 bg-background py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_70%,rgba(48,72,88,0.8)_0%,transparent_65%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-120 w-120 rounded-full border border-accent/10"
      />

      <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 md:grid-cols-2 md:gap-12 lg:gap-20 lg:px-12">
        {/* Pengantar */}
        <div className="md:pt-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-accent"
            />

            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              Make time for yourself
            </p>
          </div>

          <h2
            id="booking-title"
            className="mt-7 text-4xl font-normal leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Gaya baru.
            <span className="mt-1 block font-serif text-5xl italic text-accent sm:text-6xl lg:text-7xl">
              Mulai dari sini.
            </span>
          </h2>

          <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
            Pilih layanan dan waktu yang kamu inginkan.
            Luangkan jeda untuk tampil lebih rapi,
            lebih nyaman, dan lebih kamu.
          </p>

          <div className="mt-9 max-w-sm space-y-5 border-t border-foreground/15 pt-6">
            {[
              ["01", "Pilih layanan dan waktu."],
              ["02", "Periksa informasi kunjungan."],
              ["03", "Kirim dan simpan kode booking."],
            ].map(([number, text]) => (
              <div key={number} className="flex items-center gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 text-[10px] text-accent">
                  {number}
                </span>
                <p className="text-sm text-foreground/80">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-sm text-xs leading-6 text-muted">
            Permintaan yang tersimpan berstatus menunggu
            konfirmasi. Belum ada pengiriman pesan WhatsApp
            otomatis.
          </p>
        </div>

        {/* Form */}
        <div className="overflow-hidden rounded-3xl border border-foreground/15 bg-[linear-gradient(145deg,#2b4050_0%,#223343_55%,#1b2c39_100%)]">
          <div className="border-b border-foreground/10 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl">Rencanakan kunjungan</h3>
              <span className="rounded-full border border-accent/30 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-accent">
                Booking TEMPA
              </span>
            </div>

            <p className="mt-2 text-xs leading-6 text-muted">
              Semua kolom perlu diisi. Waktu menggunakan WIB.
            </p>
          </div>

          <form onSubmit={handleReview} className="p-6 sm:p-8">
            <fieldset disabled={locked} className="min-w-0 space-y-5">
              <div>
                <label htmlFor="booking-name" className="text-xs">
                  Nama kamu
                </label>
                <input
                  id="booking-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={60}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearReview();
                  }}
                  placeholder="Nama panggilan"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="booking-phone" className="text-xs">
                  Nomor WhatsApp
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  maxLength={40}
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearReview();
                  }}
                  placeholder="08… atau +628…"
                  aria-describedby="phone-note"
                  className={fieldClass}
                />
                <p
                  id="phone-note"
                  className="mt-2 text-[11px] leading-5 text-muted"
                >
                  Nama dan nomor disimpan bersama booking untuk
                  keperluan pengelolaan kunjungan.
                </p>
              </div>

              <div>
                <label htmlFor="booking-service" className="text-xs">
                  Pilih layanan
                </label>
                <select
                  id="booking-service"
                  required
                  value={serviceId}
                  disabled={servicesLoading || services.length === 0}
                  onChange={(event) => {
                    setServiceId(event.target.value);
                    setStartsAt("");
                    clearReview();
                  }}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    {servicesLoading
                      ? "Memuat layanan..."
                      : "Pilih layananmu"}
                  </option>
                  {services.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {money(item.price_idr)}
                    </option>
                  ))}
                </select>

                <p role="status" className="mt-2 text-xs text-muted">
                  {servicesError ||
                    (!servicesLoading && services.length === 0
                      ? "Belum ada layanan aktif."
                      : "")}
                </p>

                {servicesError && (
                  <button
                    type="button"
                    onClick={retryServices}
                    className="min-h-11 text-xs text-accent underline"
                  >
                    Coba muat layanan
                  </button>
                )}
              </div>

              {service && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/20 bg-background/40 p-4">
                  <div>
                    <p className="text-sm">{service.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      ± {service.duration_minutes} menit
                    </p>
                  </div>
                  <p className="text-lg text-accent">
                    {money(service.price_idr)}
                  </p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="booking-date" className="text-xs">
                    Tanggal pilihan
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    value={date}
                    min={
                      currentTime > 0
                        ? dateInJakarta(currentTime)
                        : undefined
                    }
                    max={
                      currentTime > 0
                        ? dateInJakarta(currentTime, 60)
                        : undefined
                    }
                    onChange={(event) => {
                      setDate(event.target.value);
                      setStartsAt("");
                      clearReview();
                    }}
                    className={`${fieldClass} scheme-dark`}
                  />
                </div>

                <div>
                  <label htmlFor="booking-time" className="text-xs">
                    Jam tersedia (WIB)
                  </label>
                  <select
                    id="booking-time"
                    required
                    value={slot ? startsAt : ""}
                    disabled={
                      !scheduleKey || scheduleLoading || slots.length === 0
                    }
                    aria-describedby="schedule-status"
                    onChange={(event) => {
                      setStartsAt(event.target.value);
                      clearReview();
                    }}
                    className={fieldClass}
                  >
                    <option value="" disabled>
                      {scheduleLoading
                        ? "Memuat jadwal..."
                        : scheduleKey && slots.length === 0
                          ? "Tidak ada slot"
                          : "Pilih jam"}
                    </option>
                    {slots.map((item) => (
                      <option key={item.startsAt} value={item.startsAt}>
                        {item.time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p
                id="schedule-status"
                role="status"
                className="text-xs leading-6 text-muted"
              >
                {scheduleMessage}
              </p>

              {scheduleKey && !scheduleLoading && (
                <button
                  type="button"
                  onClick={refreshSchedule}
                  className="min-h-11 text-xs text-accent underline underline-offset-4"
                >
                  Periksa ulang jadwal
                </button>
              )}

              <button
                type="submit"
                disabled={!canReview}
                className="inline-flex min-h-12 w-full items-center justify-between rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lihat ringkasan
                <span aria-hidden="true">→</span>
              </button>
            </fieldset>
          </form>

          {/* Ringkasan sebelum pengiriman */}
          {review && phase !== "done" && (
            <div className="mx-6 mb-6 rounded-2xl border border-accent/30 bg-background/60 p-5 sm:mx-8">
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Periksa sebelum mengirim
              </p>

              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ["Nama", review.name],
                  ["WhatsApp", `+${review.phone}`],
                  ["Layanan", review.serviceName],
                  ["Harga", money(review.price)],
                  ["Durasi", `± ${review.duration} menit`],
                  ["Tanggal", displayDate(review.slot.startsAt)],
                  ["Jam", `${review.slot.time} WIB`],
                  ["Barber", review.barber],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[5rem_1fr] gap-3"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="min-w-0 wrap-break-word">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-xs leading-6 text-muted">
                Dengan mengirim, nama dan nomor WhatsApp akan
                disimpan bersama pilihan kunjunganmu.
                Harga dan ketersediaan diperiksa ulang oleh server.
              </p>

              <button
                type="button"
                onClick={() => void sendBooking()}
                disabled={phase === "sending"}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-between rounded-full bg-accent px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:cursor-wait disabled:opacity-50"
              >
                {phase === "sending"
                  ? "Mengirim booking..."
                  : phase === "uncertain"
                    ? "Coba kirim ulang"
                    : "Kirim booking"}
                <span aria-hidden="true">↗</span>
              </button>

              {phase === "uncertain" && (
                <p className="mt-3 text-xs leading-6 text-accent">
                  Jangan refresh halaman dahulu. Pengiriman ulang
                  memakai ID yang sama untuk menghindari
                  booking ganda.
                </p>
              )}
            </div>
          )}

          {/* Pesan kegagalan */}
          {message && (
            <p
              role="alert"
              className="mx-6 mb-6 rounded-xl border border-accent/30 bg-background/40 p-4 text-sm leading-6 text-accent sm:mx-8"
            >
              {message}
            </p>
          )}

          {/* Bukti booking dari server */}
          <div role="status" aria-live="polite" aria-atomic="true">
            {receipt && (
              <div className="mx-6 mb-6 rounded-2xl border border-accent/40 bg-background/70 p-5 sm:mx-8">
                <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                  Booking tersimpan
                </p>

                <h4 className="mt-3 text-2xl">
                  Terima kasih, {review?.name}.
                </h4>

                <p className="mt-4 text-xs text-muted">
                  Kode booking
                </p>
                <p className="mt-2 break-all rounded-lg border border-foreground/15 bg-background p-3 font-mono text-sm text-accent">
                  {receipt.bookingCode}
                </p>

                <dl className="mt-5 space-y-3 text-sm">
                  {[
                    ["Status", statusLabel(receipt.status)],
                    ["Layanan", review?.serviceName ?? ""],
                    ["Harga", money(receipt.priceIdr)],
                    ["Tanggal", displayDate(receipt.startsAt)],
                    [
                      "Waktu",
                      `${displayTime(receipt.startsAt)}–${displayTime(receipt.endsAt)} WIB`,
                    ],
                    ["Barber", review?.barber ?? ""],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[5rem_1fr] gap-3"
                    >
                      <dt className="text-muted">{label}</dt>
                      <dd className="min-w-0 wrap-break-word">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-6 text-muted">
                  Simpan kode ini. Status menunggu konfirmasi
                  berarti permintaan sudah tersimpan, tetapi
                  belum dikonfirmasi admin. Belum ada pesan
                  WhatsApp otomatis yang dikirim.
                </p>

                <button
                  type="button"
                  onClick={startNewBooking}
                  className="mt-4 min-h-11 text-sm text-accent underline underline-offset-4"
                >
                  Buat booking lain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}