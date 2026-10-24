import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

async function readSmallJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new RequestError("Isi permintaan tidak tersedia.", 400);
  }

  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > 4096) {
        await reader.cancel();

        throw new RequestError(
          "Ukuran permintaan terlalu besar.",
          413,
        );
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();

    try {
      return JSON.parse(text);
    } catch {
      throw new RequestError("Format JSON tidak valid.", 400);
    }
  } finally {
    reader.releaseLock();
  }
}

function normalizePhone(value: string) {
  const trimmed = value.trim();

  // Tolak huruf atau karakter di luar format telepon.
  if (!/^[+0-9()\s-]+$/.test(trimmed)) {
    return "";
  }

  let phone = trimmed.replace(/[\s()-]/g, "");

  if (phone.startsWith("+")) {
    phone = phone.slice(1);
  }

  if (phone.startsWith("0")) {
    phone = `62${phone.slice(1)}`;
  }

  return /^628[0-9]{7,12}$/.test(phone) ? phone : "";
}

export async function POST(request: Request) {
  try {
    const configuredOrigin = process.env.APP_ORIGIN;

    if (!configuredOrigin) {
      throw new Error("Konfigurasi alamat belum tersedia.");
    }

    const allowedOrigin = new URL(configuredOrigin).origin;

    if (request.headers.get("origin") !== allowedOrigin) {
      return json(
        {
          success: false,
          message: "Asal permintaan tidak diizinkan.",
        },
        403,
      );
    }

    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

    if (contentType !== "application/json") {
      return json(
        {
          success: false,
          message: "Gunakan format application/json.",
        },
        415,
      );
    }

    const supabase = createAdminClient();

    // Batas keseluruhan sebelum memproses isi form.
    const globalLimit = await supabase.rpc(
      "consume_booking_limit",
      { p_key: "global" },
    );

    if (globalLimit.error) {
      throw new Error("Pembatas permintaan tidak tersedia.");
    }

    if (globalLimit.data !== true) {
      return json(
        {
          success: false,
          message: "Terlalu banyak permintaan. Coba lagi nanti.",
        },
        429,
        { "Retry-After": "600" },
      );
    }

    const body = await readSmallJson(request);

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      throw new RequestError("Data booking tidak valid.", 400);
    }

    const input = body as Record<string, unknown>;

    if (
      typeof input.requestId !== "string" ||
      !UUID_PATTERN.test(input.requestId) ||
      typeof input.serviceId !== "string" ||
      !UUID_PATTERN.test(input.serviceId) ||
      typeof input.name !== "string" ||
      typeof input.phone !== "string" ||
      typeof input.startsAt !== "string"
    ) {
      throw new RequestError(
        "Lengkapi nama, nomor WhatsApp, layanan, dan waktu.",
        400,
      );
    }

    const name = input.name.trim();

    if (
      [...name].length < 1 ||
      [...name].length > 60 ||
      /[\u0000-\u001f\u007f]/.test(name)
    ) {
      throw new RequestError(
        "Nama harus berisi 1–60 karakter tanpa karakter kontrol.",
        400,
      );
    }

    if (input.phone.length > 40) {
      throw new RequestError("Nomor WhatsApp tidak valid.", 400);
    }

    const phone = normalizePhone(input.phone);

    if (!phone) {
      throw new RequestError(
        "Gunakan nomor WhatsApp Indonesia, misalnya 08… atau +628…",
        400,
      );
    }

    // startsAt harus berasal dari slot API availability.
    const startsAt = input.startsAt;
    const parsedStart = new Date(startsAt);

    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
        startsAt,
      ) ||
      !Number.isFinite(parsedStart.getTime()) ||
      parsedStart.toISOString() !== startsAt
    ) {
      throw new RequestError("Format waktu tidak valid.", 400);
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Konfigurasi server belum lengkap.");
    }

    // Nomor mentah tidak disimpan di tabel penghitung.
    const phoneHash = createHmac("sha256", secretKey)
      .update(phone)
      .digest("hex");

    const phoneLimit = await supabase.rpc(
      "consume_booking_limit",
      { p_key: `phone:${phoneHash}` },
    );

    if (phoneLimit.error) {
      throw new Error("Pembatas permintaan tidak tersedia.");
    }

    if (phoneLimit.data !== true) {
      return json(
        {
          success: false,
          message:
            "Terlalu banyak percobaan untuk nomor ini. Coba lagi nanti.",
        },
        429,
        { "Retry-After": "600" },
      );
    }

    // Harga, durasi, barber, dan status ditentukan database.
    const { data, error } = await supabase.rpc(
      "create_booking",
      {
        p_request_id: input.requestId,
        p_customer_name: name,
        p_customer_phone: phone,
        p_service_id: input.serviceId,
        p_starts_at: startsAt,
      },
    );

    if (error) {
      const messages: Record<
        string,
        { status: number; message: string }
      > = {
        INVALID_INPUT: {
          status: 400,
          message: "Data booking tidak valid.",
        },
        INVALID_DATE: {
          status: 400,
          message:
            "Pilih waktu mendatang hingga 60 hari ke depan.",
        },
        INVALID_TIME_SLOT: {
          status: 400,
          message: "Pilih jam dari daftar waktu yang tersedia.",
        },
        OUTSIDE_WORKING_HOURS: {
          status: 409,
          message: "Waktu pilihan berada di luar jam kerja.",
        },
        BARBER_CLOSED: {
          status: 409,
          message: "Barber tidak bekerja pada tanggal tersebut.",
        },
        BARBER_UNAVAILABLE: {
          status: 409,
          message: "Barber tidak tersedia pada waktu tersebut.",
        },
        SERVICE_UNAVAILABLE: {
          status: 409,
          message: "Layanan tersebut sudah tidak tersedia.",
        },
        SLOT_UNAVAILABLE: {
          status: 409,
          message:
            "Waktu tersebut sudah terisi. Periksa ulang jadwal.",
        },
        REQUEST_CONFLICT: {
          status: 409,
          message:
            "ID permintaan sudah digunakan untuk pilihan lain.",
        },
      };

      const knownError =
        error.code === "P0001"
          ? messages[error.message]
          : undefined;

      if (knownError) {
        return json(
          {
            success: false,
            message: knownError.message,
          },
          knownError.status,
        );
      }

      if (error.code === "23P01") {
        return json(
          {
            success: false,
            message: "Waktu sudah terisi. Pilih waktu lainnya.",
          },
          409,
        );
      }

      throw new Error("Penyimpanan belum dapat dipastikan.");
    }

    if (
      typeof data !== "object" ||
      data === null ||
      typeof data.bookingCode !== "string" ||
      !UUID_PATTERN.test(data.bookingCode)
    ) {
      throw new Error("Respons booking tidak valid.");
    }

    return json({
      success: true,
      message:
        "Permintaan booking tersimpan. Periksa status pada bukti booking.",
      booking: {
        bookingCode: data.bookingCode,
        status: data.status,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        priceIdr: data.priceIdr,
      },
    });
  } catch (error) {
    if (error instanceof RequestError) {
      return json(
        {
          success: false,
          message: error.message,
        },
        error.status,
      );
    }

    return json(
      {
        success: false,
        message:
          "Hasil penyimpanan belum dapat dipastikan. Saat mencoba ulang, gunakan ID permintaan yang sama.",
      },
      503,
    );
  }
}