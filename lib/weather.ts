export type WeatherKind = "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "storm" | "snow";

export const WEATHER_KINDS: WeatherKind[] = ["clear", "cloudy", "fog", "drizzle", "rain", "storm", "snow"];

export const isWeatherKind = (v: unknown): v is WeatherKind => WEATHER_KINDS.includes(v as WeatherKind);

export type WeatherReport = {
  kind: WeatherKind | null;
  temp?: number;
  /** The visitor's city, from their IP (Vercel). Null when unknown, e.g. in local development. */
  city: string | null;
};

/** WMO weather code (Open-Meteo `weather_code`) → what the landscape shows. */
export function weatherKind(code: number): WeatherKind {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "cloudy";
  return "clear";
}
