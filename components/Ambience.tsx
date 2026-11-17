"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/*
 * Ambient sound with the Web Audio API. Everything is synthesised live except the frogs, a real
 * recording (public/sounds/frogs.mp3, fetched only when the sound is first turned on).
 *   Night (dark theme): crickets, frogs, an owl now and then, a light night breeze.
 *   Day (light theme):  cicadas, birdsong, a spotted dove cooing, a bright breeze in the leaves.
 *   Weather (html[data-weather]): rain over everything when it rains where the visitor is, the
 *   animals quieter under it, and thunder after each lightning flash in a storm.
 * Within each, the mix follows the scene on screen (its data-time, or the visitor's clock for the
 * opening scene): late night brings the owl, dawn brings the first birds; midday is cicada heat.
 * Off by default; the choice is remembered, and browsers only allow sound after a click or key press.
 */

const LAYERS = ["wind", "crickets", "frogs", "owl", "birds", "cicadas", "dove", "rain"] as const;
type Layer = (typeof LAYERS)[number];
type Mix = Partial<Record<Layer, number>>;

const MOODS: Record<string, Mix> = {
  // Night
  "dark:night": { wind: 0.45, crickets: 1, frogs: 0.8, owl: 0.5 },
  "dark:late": { wind: 0.65, crickets: 0.6, frogs: 0.4, owl: 1 },
  "dark:predawn": { wind: 0.45, crickets: 0.3, frogs: 0.2, owl: 0.3, birds: 0.25 },
  "dark:dawn": { wind: 0.35, crickets: 0.05, birds: 1, dove: 0.6 },
  // Day: morning → midday → afternoon → golden hour
  "light:night": { wind: 0.35, birds: 1, dove: 0.7, cicadas: 0.2 },
  "light:late": { wind: 0.45, birds: 0.35, dove: 0.3, cicadas: 1 },
  "light:predawn": { wind: 0.55, birds: 0.6, dove: 0.5, cicadas: 0.7 },
  "light:dawn": { wind: 0.4, birds: 0.7, dove: 0.4, cicadas: 0.2, crickets: 0.3 },
};
// Loudness of each layer at mix 1.
const LEVEL: Record<Layer, number> = { wind: 0.14, crickets: 0.05, frogs: 1, owl: 0.2, birds: 0.07, cicadas: 0.05, dove: 0.16, rain: 0.11 };
// Real weather (Weather.tsx sets html[data-weather]): how much rain to hear, and how much the
// animals quieten down for it.
const RAIN: Record<string, number> = { drizzle: 0.35, rain: 0.8, storm: 1 };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

class Engine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  layers = {} as Record<Layer, GainNode>;
  mix: Mix = MOODS["dark:night"];
  day = false;
  windFilter!: BiquadFilterNode;
  cicadaSwell!: GainNode;
  scheduler = 0;
  crickets = [
    { pan: -0.6, f: 4500, every: 0.82, next: 0 },
    { pan: 0.55, f: 4850, every: 1.07, next: 0.4 },
    { pan: 0.1, f: 4200, every: 1.36, next: 0.7, quiet: true },
  ];
  // Frogs: a real recording, looped with a crossfade so the seam never shows.
  frogBuf: AudioBuffer | null = null;
  frogNorm = 1;
  nextFrogs = 0;
  next = { owl: 0, bird: 0, dove: 0, cicada: 0 };
  brown: AudioBuffer | null = null;

  private noise(kind: "white" | "brown", seconds: number) {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") d[i] = w;
        else {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        }
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  private build() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 60;
    this.master.connect(hp).connect(ctx.destination);
    for (const l of LAYERS) {
      this.layers[l] = ctx.createGain();
      this.layers[l].gain.value = 0;
      this.layers[l].connect(this.master);
    }

    // Wind: brown noise with the rumble cut away (highpass), through a lowpass that drifts in soft
    // gusts. Airy rather than heavy: a light breeze at night, opened up by day into leaves rustling.
    const wind = this.noise("brown", 4);
    this.brown = wind.buffer;
    const airy = ctx.createBiquadFilter();
    airy.type = "highpass";
    airy.frequency.value = 220;
    airy.Q.value = 0.5;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 750;
    this.windFilter.Q.value = 0.5;
    const gust = ctx.createGain();
    gust.gain.value = 0.7;
    const lfo1 = ctx.createOscillator();
    lfo1.frequency.value = 0.06;
    const lfo1Depth = ctx.createGain();
    lfo1Depth.gain.value = 300;
    lfo1.connect(lfo1Depth).connect(this.windFilter.frequency);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11;
    const lfo2Depth = ctx.createGain();
    lfo2Depth.gain.value = 0.2;
    lfo2.connect(lfo2Depth).connect(gust.gain);
    wind.connect(airy).connect(this.windFilter).connect(gust).connect(this.layers.wind);
    wind.start();
    lfo1.start();
    lfo2.start();

    // Cicadas: a high, buzzing band of noise, pulsing fast, that swells up and dies away in waves.
    const buzz = this.noise("white", 2);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 5600;
    band.Q.value = 5;
    const pulse = ctx.createGain();
    pulse.gain.value = 0.5;
    const am = ctx.createOscillator();
    am.type = "square";
    am.frequency.value = 85;
    const amDepth = ctx.createGain();
    amDepth.gain.value = 0.5;
    am.connect(amDepth).connect(pulse.gain);
    this.cicadaSwell = ctx.createGain();
    this.cicadaSwell.gain.value = 0;
    buzz.connect(band).connect(pulse).connect(this.cicadaSwell).connect(this.layers.cicadas);
    buzz.start();
    am.start();

    // Rain: a hiss of white noise, band-limited so it reads as drops on leaves rather than static.
    const rain = this.noise("white", 3);
    const rainHp = ctx.createBiquadFilter();
    rainHp.type = "highpass";
    rainHp.frequency.value = 900;
    const rainLp = ctx.createBiquadFilter();
    rainLp.type = "lowpass";
    rainLp.frequency.value = 6500;
    rain.connect(rainHp).connect(rainLp).connect(this.layers.rain);
    rain.start();

    fetch("/sounds/frogs.mp3")
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => {
        // Level it to a known loudness, whatever the recording's own level.
        const d = buf.getChannelData(0);
        let sum = 0;
        let n = 0;
        for (let i = 0; i < d.length; i += 64, n++) sum += d[i] * d[i];
        const rms = Math.sqrt(sum / Math.max(1, n));
        this.frogNorm = Math.min(6, 0.035 / Math.max(rms, 1e-4));
        this.frogBuf = buf;
      })
      .catch(() => {}); // no frogs is fine; the rest still plays
  }

  // One pass of the frog recording, fading in and out so consecutive passes overlap smoothly.
  private frogPass(t: number) {
    const ctx = this.ctx!;
    const buf = this.frogBuf!;
    const fade = 3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(this.frogNorm, t + fade);
    g.gain.setValueAtTime(this.frogNorm, t + buf.duration - fade);
    g.gain.linearRampToValueAtTime(0, t + buf.duration);
    src.connect(g).connect(this.layers.frogs);
    src.start(t);
    src.stop(t + buf.duration + 0.05);
    return buf.duration - fade;
  }

  // A cricket chirp: a few very short pulses of a high, pure tone.
  private chirp(t: number, f: number, pan: number, quiet = false) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.value = f * rand(0.99, 1.01);
    const env = ctx.createGain();
    env.gain.value = 0;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    const pulses = Math.random() < 0.3 ? 4 : 3;
    const peak = quiet ? 0.35 : 1;
    for (let i = 0; i < pulses; i++) {
      const s = t + i * 0.045;
      env.gain.setValueAtTime(0, s);
      env.gain.linearRampToValueAtTime(peak, s + 0.005);
      env.gain.linearRampToValueAtTime(0, s + 0.03);
    }
    osc.connect(env).connect(p).connect(this.layers.crickets);
    osc.start(t);
    osc.stop(t + pulses * 0.045 + 0.05);
  }

  // Thunder: a short crack, then a long low rumble that rolls away.
  thunder(delay: number) {
    const ctx = this.ctx;
    if (!ctx || !this.brown || !(RAIN[document.documentElement.dataset.weather ?? ""] > 0)) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.brown;
    src.playbackRate.value = rand(0.5, 0.8);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + 1.2);
    const env = ctx.createGain();
    const len = rand(3, 5.5);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.06);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.8);
    env.gain.exponentialRampToValueAtTime(0.0001, t + len);
    const p = ctx.createStereoPanner();
    p.pan.value = rand(-0.5, 0.5);
    src.connect(lp).connect(env).connect(p).connect(this.master);
    src.start(t, rand(0, 2));
    src.stop(t + len + 0.1);
  }

  // A soft whistled note with a gentle pitch bend: the building block of the owl and the dove.
  private hoot(t: number, f: number, dur: number, bend: number, layer: Layer, pan: number, peak = 1) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * bend, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = f * 2.2;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + dur * 0.25);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    osc.connect(lp).connect(env).connect(p).connect(this.layers[layer]);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Owl, far off: "hoo ... hoo-hoo-hoooo".
  private owl(t: number) {
    const pan = rand(-0.7, 0.7);
    const f = rand(360, 420);
    this.hoot(t, f, 0.45, 0.94, "owl", pan);
    let s = t + 0.9;
    for (let i = 0; i < 2; i++, s += 0.32) this.hoot(s, f * 1.03, 0.22, 0.97, "owl", pan, 0.7);
    this.hoot(s + 0.05, f, 0.7, 0.9, "owl", pan);
  }

  // Spotted dove, the sound of a Vietnamese morning: "cu cu ... cùuu".
  private dove(t: number) {
    const pan = rand(-0.6, 0.6);
    const f = rand(540, 620);
    this.hoot(t, f, 0.22, 1.02, "dove", pan, 0.8);
    this.hoot(t + 0.3, f * 1.05, 0.28, 0.98, "dove", pan);
    this.hoot(t + 0.85, f * 0.98, 0.55, 0.86, "dove", pan);
  }

  // A short bird phrase: two to six whistled notes, each a quick pitch sweep, sometimes trilled.
  private bird(t: number) {
    const ctx = this.ctx!;
    const p = ctx.createStereoPanner();
    p.pan.value = rand(-0.8, 0.8);
    p.connect(this.layers.birds);
    const base = rand(2300, 3800);
    const notes = 2 + Math.floor(Math.random() * 5);
    const trill = Math.random() < 0.3;
    let s = t;
    for (let i = 0; i < notes; i++) {
      const dur = trill ? rand(0.03, 0.05) : rand(0.06, 0.16);
      const osc = ctx.createOscillator();
      const from = base * (trill ? 1 : rand(0.8, 1.2));
      const to = from * (Math.random() < 0.5 ? rand(1.2, 1.6) : rand(0.6, 0.85));
      osc.frequency.setValueAtTime(from, s);
      osc.frequency.exponentialRampToValueAtTime(to, s + dur);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, s);
      env.gain.exponentialRampToValueAtTime(1, s + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      osc.connect(env).connect(p);
      osc.start(s);
      osc.stop(s + dur + 0.02);
      s += dur + (trill ? 0.015 : rand(0.03, 0.1));
    }
  }

  // Cicada wave: swell for a couple of seconds, hold, fade, then quiet.
  private cicadaWave(t: number) {
    const g = this.cicadaSwell.gain;
    const up = rand(1.5, 3);
    const hold = rand(3, 7);
    g.setTargetAtTime(1, t, up / 3);
    g.setTargetAtTime(0, t + up + hold, 0.8);
    return up + hold + 3;
  }

  private on(l: Layer) {
    return (this.mix[l] ?? 0) > 0.01;
  }

  // Look-ahead scheduling: every 100 ms, book the calls due in the next 300 ms.
  private schedule = () => {
    const now = this.ctx!.currentTime;
    const ahead = now + 0.3;
    if (this.on("crickets")) {
      for (const c of this.crickets) {
        if (c.next < now) c.next = now + rand(0, c.every);
        while (c.next < ahead) {
          this.chirp(c.next, c.f, c.pan, c.quiet);
          c.next += c.every * rand(0.92, 1.08);
        }
      }
    }
    if (this.on("frogs") && this.frogBuf) {
      if (this.nextFrogs < now) this.nextFrogs = now;
      if (this.nextFrogs < ahead) this.nextFrogs += this.frogPass(this.nextFrogs);
    }
    const every = (key: keyof Engine["next"], layer: Layer, lo: number, hi: number, play: (t: number) => number | void) => {
      if (!this.on(layer)) return;
      if (this.next[key] < now) this.next[key] = now + rand(lo * 0.3, lo);
      if (this.next[key] < ahead) {
        const busy = play(this.next[key]) || 0;
        this.next[key] += busy + rand(lo, hi) / Math.max(0.4, this.mix[layer] ?? 0);
      }
    };
    every("owl", "owl", 9, 22, (t) => this.owl(t));
    every("dove", "dove", 6, 14, (t) => this.dove(t));
    every("bird", "birds", 0.8, 3.5, (t) => this.bird(t));
    every("cicada", "cicadas", 2, 8, (t) => this.cicadaWave(t));
  };

  // Which scene is on screen, and so which mood. Called a few times a second while playing.
  private follow = () => {
    const root = document.documentElement;
    let scene: HTMLElement | null = null;
    let best = -1;
    document.querySelectorAll<HTMLElement>(".scene[data-live]").forEach((s) => {
      const o = parseFloat(s.style.opacity || "1");
      if (o > best) {
        best = o;
        scene = s;
      }
    });
    scene ??= document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest<HTMLElement>(".scene") ?? null;
    const day = root.dataset.theme === "light";
    if (scene) {
      const s = scene as HTMLElement;
      const time = s.hasAttribute("data-clock") ? root.dataset.clock || s.dataset.time : s.dataset.time;
      this.mix = MOODS[`${day ? "light" : "dark"}:${time}`] ?? this.mix;
    }
    const now = this.ctx!.currentTime;
    const rain = RAIN[root.dataset.weather ?? ""] ?? 0;
    for (const l of LAYERS) {
      const v = l === "rain" ? rain : (this.mix[l] ?? 0) * (l === "wind" ? 1 + rain * 0.5 : 1 - rain * 0.6);
      this.layers[l].gain.setTargetAtTime(v * LEVEL[l], now, 0.9);
    }
    if (day !== this.day) {
      this.day = day;
      this.windFilter.frequency.setTargetAtTime(day ? 1600 : 750, now, 1);
    }
  };

  start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    ctx.resume();
    this.day = !this.day; // force the wind filter to settle on the current theme
    this.follow();
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(1, ctx.currentTime, 0.5);
    clearInterval(this.scheduler);
    this.scheduler = window.setInterval(() => {
      this.follow();
      this.schedule();
    }, 100);
  }

  stop() {
    const ctx = this.ctx;
    clearInterval(this.scheduler);
    if (!ctx) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  }

  pause(hidden: boolean) {
    if (!this.ctx) return;
    if (hidden) this.ctx.suspend();
    else this.ctx.resume();
  }
}

// ---- On/off state, shared with the header button.
let engine: Engine | null = null;
let on = false;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const set = (v: boolean) => {
  on = v;
  try {
    localStorage.setItem("sound", v ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
};

export function SoundToggle() {
  const { c } = useLanguage();
  const playing = useSyncExternalStore(
    subscribe,
    () => on,
    () => false,
  );

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("sound");
    } catch {}
    // Remembered as on: browsers block sound until the visitor interacts, so start on the first one.
    const arm = () => on && (engine ??= new Engine()).start();
    if (saved === "on") {
      on = true;
      listeners.forEach((l) => l());
      addEventListener("pointerdown", arm, { once: true, capture: true });
      addEventListener("keydown", arm, { once: true, capture: true });
    }
    const onVis = () => on && engine?.pause(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const onThunder = (e: Event) => on && engine?.thunder((e as CustomEvent<{ delay: number }>).detail?.delay ?? 1);
    addEventListener("thunder", onThunder);
    return () => {
      removeEventListener("pointerdown", arm, { capture: true });
      removeEventListener("keydown", arm, { capture: true });
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("thunder", onThunder);
      engine?.stop();
    };
  }, []);

  const toggle = () => {
    engine ??= new Engine();
    if (on) engine.stop();
    else engine.start();
    set(!on);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? c.ui.soundOff : c.ui.soundOn}
      title={playing ? c.ui.soundOff : c.ui.soundOn}
      className="grid size-10 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink aria-pressed:text-accent"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
        {playing ? (
          <>
            <path className="sound-wave" d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
            <path className="sound-wave" d="M18 7a7 7 0 0 1 0 10" />
          </>
        ) : (
          <path d="M16 10l4 4M20 10l-4 4" />
        )}
      </svg>
    </button>
  );
}
