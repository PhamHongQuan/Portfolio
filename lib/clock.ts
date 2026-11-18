export type Clock = "night" | "late" | "predawn" | "dawn";

/**
 * The opening scene's sky follows the visitor's real clock. In the dark theme: evening → late night
 * (23:00) → before dawn (03:00) → dawn (05:00). In the light theme the same four skies read as
 * morning → midday (11:00) → afternoon (14:00) → golden hour (17:00). `?clock=dawn` forces one.
 *
 * Kept self-contained: its source is also inlined into the <head> script, so the sky is right
 * before the first paint.
 */
export function clockFor(theme: string, hour: number, search: string): Clock {
  const forced = /[?&]clock=(night|late|predawn|dawn)\b/.exec(search);
  if (forced) return forced[1] as Clock;
  if (theme === "dark") {
    if (hour >= 23 || hour < 3) return "late";
    if (hour < 5) return "predawn";
    if (hour < 6.5) return "dawn";
    return "night";
  }
  if (hour >= 11 && hour < 14) return "late";
  if (hour >= 14 && hour < 17) return "predawn";
  if (hour >= 17 && hour < 19.5) return "dawn";
  return "night";
}

/** Default theme from the visitor's clock: light by day (06:30–18:30), dark at night. Inlined in <head> too. */
export function themeFor(hour: number): "light" | "dark" {
  return hour >= 6.5 && hour < 18.5 ? "light" : "dark";
}

export const hourNow = () => {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

export const clockNow = (theme: string) => clockFor(theme, hourNow(), location.search);
