import { NextRequest } from "next/server";
import { weatherKind, type WeatherReport } from "@/lib/weather";

// Fallback when the visitor's location is unknown (local development, or no geo headers).
const HCMC = { lat: 10.8, lon: 106.7 };

/**
 * Current weather where the visitor is. The location comes from the IP geolocation headers Vercel
 * adds to every request (no permission prompt, city level). Coordinates are rounded to ~10 km before
 * they go to Open-Meteo, the visitor's IP never leaves this server, and nothing is stored.
 */
export async function GET(req: NextRequest) {
  const h = req.headers;
  const lat = parseFloat(h.get("x-vercel-ip-latitude") ?? "");
  const lon = parseFloat(h.get("x-vercel-ip-longitude") ?? "");
  const located = Number.isFinite(lat) && Number.isFinite(lon);
  const at = located ? { lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 } : HCMC;
  const cityHeader = h.get("x-vercel-ip-city");
  let city: string | null = null;
  if (located && cityHeader) {
    try {
      city = decodeURIComponent(cityHeader);
    } catch {
      city = cityHeader;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${at.lat}&longitude=${at.lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 600 } }); // the same ~10 km cell shares one answer for 10 min
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();
    const body: WeatherReport = {
      kind: weatherKind(Number(data.current?.weather_code)),
      temp: Math.round(Number(data.current?.temperature_2m)),
      city,
    };
    return Response.json(body, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch {
    const body: WeatherReport = { kind: null, city };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  }
}
