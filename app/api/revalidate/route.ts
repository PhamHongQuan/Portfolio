import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { CONTENT_TAG } from "@/lib/site";

// Called by the admin after each save: POST with header `x-revalidate-secret: <REVALIDATE_SECRET>`.
// Drops the cached Supabase read; the next visit rebuilds the pages with the new content.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const given = req.headers.get("x-revalidate-secret") ?? "";
  const ok = secret.length > 0 && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ ok: false }, { status: 401 });
  revalidateTag(CONTENT_TAG, { expire: 0 }); // expire now: the next visit already sees the new content
  return Response.json({ ok: true, revalidated: CONTENT_TAG, at: new Date().toISOString() });
}
