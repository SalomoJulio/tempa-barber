import { connection, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  await connection();

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, price_idr, duration_minutes")
      .eq("active", true)
      .order("price_idr", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Data layanan belum dapat dimuat.",
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        services: data,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database belum tersedia.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}