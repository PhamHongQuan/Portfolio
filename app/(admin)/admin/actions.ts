"use server";
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/site";

// Called after a save. Public sign-up is off, so a token Supabase accepts is the admin's.
// Writes are guarded separately by RLS; this only drops the cached read.
export async function publish(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, error: "thiếu SUPABASE_URL/SUPABASE_ANON_KEY" };
  try {
    const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return { ok: false, error: "phiên đăng nhập không hợp lệ" };
  } catch {
    return { ok: false, error: "không kết nối được Supabase" };
  }
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return { ok: true };
}
