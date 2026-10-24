import { connection, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 24 * 60 * 60 * 1000;
const STEP_MS = 30 * 60 * 1000;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
}

export async function GET(request: Request) {
  await connection();

  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "";
  const serviceId = params.get("serviceId") ?? "";

  if (!isValidDate(date)) {
    return json(
      {
        success: false,
        message: "Tanggal harus valid dengan format YYYY-MM-DD.",
      },
      400,
    );
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      serviceId,
    )
  ) {
    return json(
      {
        success: false,
        message: "Pilihan layanan tidak valid.",
      },
      400,
    );
  }

  const today = jakartaToday();
  const daysAhead =
    (Date.parse(`${date}T00:00:00Z`) -
      Date.parse(`${today}T00:00:00Z`)) /
    DAY_MS;

  if (daysAhead < 0 || daysAhead > 60) {
    return json(
      {
        success: false,
        message: "Pilih tanggal hari ini hingga 60 hari ke depan.",
      },
      400,
    );
  }

  try {
    const supabase = createAdminClient();

    const [serviceResult, barberResult] = await Promise.all([
      supabase
        .from("services")
        .select("id, duration_minutes")
        .eq("id", serviceId)
        .eq("active", true)
        .maybeSingle(),

      supabase
        .from("barbers")
        .select("id, name")
        .eq("slug", "arga")
        .eq("active", true)
        .maybeSingle(),
    ]);

    if (serviceResult.error || barberResult.error) {
      throw new Error("Database tidak tersedia.");
    }

    const service = serviceResult.data;
    const barber = barberResult.data;

    if (!service || !barber) {
      return json(
        {
          success: false,
          message: "Layanan atau barber tidak tersedia.",
        },
        404,
      );
    }

    const duration = Number(service.duration_minutes);

    if (!Number.isInteger(duration) || duration < 5 || duration > 240) {
      throw new Error("Durasi layanan tidak valid.");
    }

    // Menggunakan tanggal kalender, bukan zona waktu komputer server.
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();

    const { data: hours, error: hoursError } = await supabase
      .from("working_hours")
      .select("opens_at, closes_at")
      .eq("barber_id", barber.id)
      .eq("weekday", weekday)
      .maybeSingle();

    if (hoursError) {
      throw new Error("Jadwal tidak dapat dibaca.");
    }

    if (!hours) {
      return json({
        success: true,
        date,
        timeZone: "Asia/Jakarta",
        barber: {
          id: barber.id,
          name: barber.name,
        },
        slots: [],
        message: "Barber tidak memiliki jadwal kerja pada hari ini.",
      });
    }

    const opensAt = Date.parse(
      `${date}T${hours.opens_at}+07:00`,
    );
    const closesAt = Date.parse(
      `${date}T${hours.closes_at}+07:00`,
    );

    if (
      !Number.isFinite(opensAt) ||
      !Number.isFinite(closesAt) ||
      closesAt <= opensAt
    ) {
      throw new Error("Jam kerja tidak valid.");
    }

    const openIso = new Date(opensAt).toISOString();
    const closeIso = new Date(closesAt).toISOString();

    // Hanya mengambil rentang waktu; nama dan telepon tidak dibaca.
    const [bookingsResult, timeOffResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("starts_at, ends_at", { count: "exact" })
        .eq("barber_id", barber.id)
        .in("status", [
          "pending",
          "confirmed",
          "completed",
          "no_show",
        ])
        .lt("starts_at", closeIso)
        .gt("ends_at", openIso),

      supabase
        .from("barber_time_off")
        .select("starts_at, ends_at", { count: "exact" })
        .eq("barber_id", barber.id)
        .lt("starts_at", closeIso)
        .gt("ends_at", openIso),
    ]);

    if (bookingsResult.error || timeOffResult.error) {
      throw new Error("Ketersediaan tidak dapat dibaca.");
    }

    const bookings = bookingsResult.data ?? [];
    const timeOff = timeOffResult.data ?? [];

    // Jangan menawarkan slot jika respons database terpotong.
    if (
      bookingsResult.count !== bookings.length ||
      timeOffResult.count !== timeOff.length
    ) {
      throw new Error("Data jadwal tidak lengkap.");
    }

    const blocked = [...bookings, ...timeOff].map((item) => ({
      start: Date.parse(item.starts_at),
      end: Date.parse(item.ends_at),
    }));

    if (
      blocked.some(
        (item) =>
          !Number.isFinite(item.start) ||
          !Number.isFinite(item.end) ||
          item.end <= item.start,
      )
    ) {
      throw new Error("Data rentang waktu tidak valid.");
    }

    const durationMs = duration * 60 * 1000;
    const now = Date.now();

    const slots: {
      time: string;
      startsAt: string;
      endsAt: string;
    }[] = [];

    for (
      let start = opensAt;
      start + durationMs <= closesAt;
      start += STEP_MS
    ) {
      const end = start + durationMs;

      if (start <= now) {
        continue;
      }

      const overlaps = blocked.some(
        (item) => start < item.end && end > item.start,
      );

      if (!overlaps) {
        slots.push({
          time: formatTime(start),
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
        });
      }
    }

    return json({
      success: true,
      date,
      timeZone: "Asia/Jakarta",
      barber: {
        id: barber.id,
        name: barber.name,
      },
      durationMinutes: duration,
      slots,
      message:
        slots.length > 0
          ? "Pilih waktu yang tersedia."
          : "Tidak ada waktu tersedia pada tanggal ini.",
    });
  } catch {
    return json(
      {
        success: false,
        message: "Jadwal belum dapat dimuat. Silakan coba lagi.",
      },
      503,
    );
  }
}