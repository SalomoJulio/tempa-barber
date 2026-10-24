"use server";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, requireAdmin, validActionOrigin } from "@/lib/tempa-admin/auth";

export async function loginAdmin(
  _previous: { error: string }, form: FormData,
): Promise<{ error: string }> {
  if (!(await validActionOrigin())) return { error: "Alamat akses tidak diizinkan." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || email.length > 254 || !email.includes("@") || !password || password.length > 256) {
    return { error: "Masukkan email dan password yang valid." };
  }

  try {
    const db = createAdminClient();
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!secret) throw new Error();
    const globalLimit = await db.rpc("consume_admin_login_limit", { p_key: "global" });
    if (globalLimit.error) throw new Error();
    if (globalLimit.data !== true) return { error: "Terlalu banyak percobaan. Tunggu 10 menit." };
    const digest = createHmac("sha256", secret).update(email).digest("hex");
    const emailLimit = await db.rpc("consume_admin_login_limit", { p_key: `email:${digest}` });
    if (emailLimit.error) throw new Error();
    if (emailLimit.data !== true) return { error: "Terlalu banyak percobaan. Tunggu 10 menit." };

    // Klien login terpisah: sesi pengguna tidak dipasang pada klien admin.
    const loginClient = createAdminClient();
    const result = await loginClient.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.session || !result.data.user) {
      return { error: "Email, password, atau akses admin tidak sesuai." };
    }
    const membership = await db.from("admin_users").select("user_id")
      .eq("user_id", result.data.user.id).maybeSingle();
    if (membership.error) throw new Error();
    if (!membership.data) return { error: "Email, password, atau akses admin tidak sesuai." };

    (await cookies()).set(ADMIN_COOKIE, result.data.session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", path: "/admin",
      maxAge: Math.min(result.data.session.expires_in, 3600),
    });
  } catch {
    return { error: "Login belum tersedia. Periksa konfigurasi dan koneksi." };
  }
  redirect("/admin");
}

export async function logoutAdmin() {
  if (!(await validActionOrigin())) throw new Error("Alamat tidak diizinkan.");
  (await cookies()).set(ADMIN_COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "strict", path: "/admin", maxAge: 0,
  });
  redirect("/admin/login");
}

export async function changeBookingStatus(
  bookingId: string, status: string, _previous: { error: string }, _form: FormData,
): Promise<{ error: string }> {
  void _previous;
  void _form;
  if (!(await validActionOrigin())) return { error: "Alamat tidak diizinkan." };
  const admin = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(bookingId) || !["confirmed","cancelled","completed","no_show"].includes(status)) {
    return { error: "Perubahan tidak valid." };
  }
  try {
    const { error } = await createAdminClient().rpc("admin_change_booking_status", {
      p_actor_id: admin.id, p_booking_id: bookingId, p_status: status,
    });
    if (error) {
      if (error.message === "VISIT_NOT_FINISHED") return { error: "Tunggu hingga waktu layanan berakhir." };
      if (error.message === "INVALID_STATUS_TRANSITION") return { error: "Status sudah berubah. Muat ulang dashboard." };
      return { error: "Perubahan belum berhasil. Muat ulang untuk memeriksa status terbaru." };
    }
    revalidatePath("/admin");
    return { error: "" };
  } catch {
    return { error: "Hasil belum dapat dipastikan. Muat ulang untuk memeriksa status." };
  }
}
