import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const ADMIN_COOKIE = "tempa_admin_access";

export async function validActionOrigin() {
  const origin = (await headers()).get("origin");
  const configured = process.env.APP_ORIGIN;
  if (!configured || !origin) return false;
  try { return origin === new URL(configured).origin; }
  catch { return false; }
}

export async function getAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  // Verifikasi token melalui Supabase Auth; jangan percaya isi cookie saja.
  const db = createAdminClient();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;

  const membership = await db.from("admin_users")
    .select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (membership.error) throw new Error("Pemeriksaan akses admin belum tersedia.");
  if (!membership.data) return null;
  return { id: data.user.id, email: data.user.email ?? "Admin TEMPA" };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
