/**
 * MusicPlayer — FREQUENZA '26 signal module
 * ────────────────────────────────────────────────────────────────────────────
 * A floating frequency-control deck rather than a conventional player.
 *
 * Audio architecture (the part that used to break):
 *   • ONE persistent HTMLAudioElement is created in a mount-only effect and
 *     stored in a ref. It is never re-created on re-render, and the component
 *     never renders an <audio> tag (so React can never touch `src` and reset
 *     playback underneath us).
 *   • `play` / `pause` / `ended` / `timeupdate` / `loadedmetadata` / `error`
 *     listeners are attached exactly once, and they are the source of truth for
 *     the `playing` flag — UI state never disagrees with the element.
 *   • Progress is driven by a single requestAnimationFrame loop that only runs
 *     while audio is playing. It writes the fill width + time label straight to
 *     the DOM through refs, so playback does NOT cause 60 React renders/sec.
 *   • Track changes reuse the same element: pause → assign src → currentTime = 0
 *     → load().
 *   • `ended` resets currentTime to 0 so pressing Play restarts the same track.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const TRACKS = [
  {
    id: "t1",
    title: "Electro Frequency",
    artist: "FREQUENZA '26",
    src: "/assets/ambient-freq.mp3",
  },
  {
    id: "t2",
    title: "Tech Pulse",
    artist: "ECE Waveform",
    src: "/assets/tech-pulse.mp3",
  },
];

const BAR_COUNT = 22;
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => i);

const formatTime = (t) => {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

/* Pseudo carrier readout — ties the HUD to real playback position so the panel
   feels like a live instrument rather than decoration. */
const carrierHz = (t, d) => {
  const ratio = d > 0 ? Math.min(1, Math.max(0, t / d)) : 0;
  return (88.5 + ratio * 107.5).toFixed(1);
};

function SpectrumBars({ active }) {
  return (
    <div className="flex h-6 items-end gap-[2px]" aria-hidden="true">
      {BARS.map((i) => (
        <span
          key={i}
          className="w-[3px] flex-1 origin-bottom rounded-t-[1px]"
          style={{
            height: "100%",
            transform: "scaleY(0.2)",
            background: `linear-gradient(to top, rgba(10,127,158,${
              0.5 + (i % 5) * 0.1
            }), rgba(168,236,253,${0.35 + (i % 4) * 0.16}))`,
            animation: active
              ? `barRise ${0.62 + (i % 6) * 0.19}s cubic-bezier(0.4,0,0.6,1) ${
                  (i % 8) * 0.11
                }s infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [fault, setFault] = useState(false);

  const audioRef = useRef(null);
  const rafRef = useRef(0);
  const fillRef = useRef(null);
  const knobRef = useRef(null);
  const elapsedRef = useRef(null);
  const carrierRef = useRef(null);
  const seekRef = useRef(null);
  const scrubbingRef = useRef(false);

  const paintRef = useRef(null);
  const lastVolumeRef = useRef(0.75);
  const openRef = useRef(false);

  const track = TRACKS[index];

  /* ── Lifetime: create the single audio element, wire events, tear down ──── */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.75;
    audioRef.current = audio;

    const stopLoop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    /* rAF writes DOM directly — zero React renders during playback. */
    const paint = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      const ratio = d > 0 ? Math.min(1, audio.currentTime / d) : 0;

      if (fillRef.current) fillRef.current.style.transform = `scaleX(${ratio})`;
      if (knobRef.current) knobRef.current.style.left = `${ratio * 100}%`;
      if (elapsedRef.current) elapsedRef.current.textContent = formatTime(audio.currentTime);
      if (carrierRef.current) carrierRef.current.textContent = `${carrierHz(audio.currentTime, d)} MHz`;

      if (seekRef.current) {
        seekRef.current.setAttribute(
          "aria-valuetext",
          `${formatTime(audio.currentTime)} of ${formatTime(d)}`,
        );
      }

      /* Keep looping only while audible AND visible — with the deck collapsed
         the bar isn't mounted, so there is nothing to paint. */
      if (!audio.paused && !audio.ended && openRef.current) {
        rafRef.current = requestAnimationFrame(paint);
      } else {
        rafRef.current = 0;
      }
    };

    /* Exposed so the open-effect can restart the loop without re-creating it. */
    paintRef.current = paint;

    const onPlay = () => {
      setPlaying(true);
      setFault(false);
      if (!rafRef.current) rafRef.current = requestAnimationFrame(paint);
    };

    const onPause = () => {
      setPlaying(false);
      stopLoop();
      /* settle the bar on the exact frame playback stopped */
      paint();
    };

    const onEnded = () => {
      /* Restart-from-zero: Play must resume this same track, not dead-end. */
      audio.currentTime = 0;
      setPlaying(false);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      stopLoop();
      if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
      if (knobRef.current) knobRef.current.style.left = "0%";
      if (elapsedRef.current) elapsedRef.current.textContent = "0:00";
      if (seekRef.current) {
        seekRef.current.setAttribute("aria-valuenow", "0");
        seekRef.current.setAttribute("aria-valuetext", `0:00 of ${formatTime(audio.duration)}`);
      }
    };

    const onTimeUpdate = () => {
      /* Covers seeking, scrubbing and any moment the rAF loop is idle. */
      if (!rafRef.current) {
        const d = Number.isFinite(audio.duration) ? audio.duration : 0;
        const ratio = d > 0 ? Math.min(1, audio.currentTime / d) : 0;
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${ratio})`;
        if (knobRef.current) knobRef.current.style.left = `${ratio * 100}%`;
        if (elapsedRef.current) elapsedRef.current.textContent = formatTime(audio.currentTime);
        if (carrierRef.current) carrierRef.current.textContent = `${carrierHz(audio.currentTime, d)} MHz`;
        if (seekRef.current) seekRef.current.setAttribute("aria-valuenow", String(Math.round(audio.currentTime)));
      }
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration((prev) => (prev === d ? prev : d));
    };

    const onLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setFault(false);
    };

    const onError = () => {
      stopLoop();
      setPlaying(false);
      setDuration(0);
      setFault(true);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      stopLoop();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  /* Load the first track once the element exists. */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = TRACKS[0].src;
    audio.currentTime = 0;
    audio.load();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  /* Close the panel without stopping playback. */
  const closePanel = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Tell the paint loop whether the deck is on screen, and (re)arm it when
     the panel opens mid-playback. */
  useEffect(() => {
    openRef.current = open;
    if (!open || !paintRef.current) return;
    const audio = audioRef.current;
    if (audio && !audio.paused && !audio.ended && !rafRef.current) {
      rafRef.current = requestAnimationFrame(paintRef.current);
    }
  }, [open]);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.ended || audio.currentTime >= (audio.duration || 0)) {
        audio.currentTime = 0;
      }
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setFault(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    /* If the source errored out, reload it before retrying so Play always
       recovers instead of replaying a dead network state. */
    if (audio.error) {
      audio.load();
    }

    if (audio.paused || audio.ended) {
      startPlayback();
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [startPlayback]);

  /* Same element, new source. No second Audio object is ever created. */
  const loadTrack = useCallback((nextIndex, autoplay) => {
    const audio = audioRef.current;
    if (!audio) return;
    const i = (nextIndex + TRACKS.length) % TRACKS.length;

    audio.pause();
    setPlaying(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    setIndex(i);
    setFault(false);
    setDuration(0);

    audio.src = TRACKS[i].src;
    audio.currentTime = 0;
    audio.load();

    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
    if (knobRef.current) knobRef.current.style.left = "0%";
    if (elapsedRef.current) elapsedRef.current.textContent = "0:00";
    if (seekRef.current) seekRef.current.setAttribute("aria-valuenow", "0");

    if (autoplay) startPlayback();
  }, [startPlayback]);

  const nextTrack = useCallback(() => loadTrack(index + 1, playing), [index, playing, loadTrack]);
  const prevTrack = useCallback(() => loadTrack(index - 1, playing), [index, playing, loadTrack]);

  /* ── Seeking ───────────────────────────────────────────────────────────── */
  const seekToRatio = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio) return;
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (d <= 0) return;
    const r = Math.min(1, Math.max(0, ratio));
    audio.currentTime = r * d;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${r})`;
    if (knobRef.current) knobRef.current.style.left = `${r * 100}%`;
    if (elapsedRef.current) elapsedRef.current.textContent = formatTime(r * d);
  }, []);

  const ratioFromEvent = useCallback((clientX) => {
    const el = seekRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return (clientX - rect.left) / rect.width;
  }, []);

  const onSeekPointerDown = (e) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    scrubbingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    seekToRatio(ratioFromEvent(e.clientX));
  };

  const onSeekPointerMove = (e) => {
    if (!scrubbingRef.current) return;
    seekToRatio(ratioFromEvent(e.clientX));
  };

  const endScrub = (e) => {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onSeekKeyDown = (e) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      seekToRatio((audio.currentTime + step) / audio.duration);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      seekToRatio((audio.currentTime - step) / audio.duration);
    } else if (e.key === "Home") {
      e.preventDefault();
      seekToRatio(0);
    } else if (e.key === "End") {
      e.preventDefault();
      seekToRatio(1);
    }
  };

  const onVolumeChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (v > 0 && muted) setMuted(false);
  };

  /* Mute remembers the pre-mute level so unmuting restores it instead of
     snapping to a hardcoded default. */
  const toggleMute = () => {
    const audio = audioRef.current;
    const current = audio ? audio.volume : volume;
    const willMute = !muted;
    if (willMute && current > 0) lastVolumeRef.current = current;
    setMuted(willMute);
    if (!willMute) setVolume(lastVolumeRef.current || 0.75);
  };

  const playLabel = playing ? "Pause music" : "Play music";

  /* ── Collapsed: FREQUENZA signal node ─────────────────────────────────────
     A miniature surface-mount PCB module rather than a media button:
     anodised housing, routed copper traces, a QFN die, indicator LEDs and
     solder pads. Playback state drives only the illumination. */
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open music player"
        aria-expanded="false"
        className="group fixed left-3 top-1/2 z-[9999] h-[96px] w-[80px] -translate-y-1/2 rounded-[12px] transition-transform duration-300 ease-out hover:-translate-y-[calc(50%+2px)] focus-visible:-translate-y-[calc(50%+2px)] sm:left-5 sm:h-[106px] sm:w-[88px]"
      >
        {/* resting glow — keeps the node findable even when nothing is playing */}
        <span
          className="pointer-events-none absolute -inset-3 rounded-[18px] bg-signal-500/15 blur-md transition-opacity duration-500"
          aria-hidden="true"
          style={{ opacity: playing ? 0.9 : 0.55 }}
        />
        {/* carrier halo — pulses while a signal is live, drifts slowly at rest */}
        <span
          className="pointer-events-none absolute -inset-1.5 rounded-[16px] border border-signal-400/40 animate-freq-ring"
          aria-hidden="true"
          style={{ animationPlayState: "running", opacity: playing ? 1 : 0.4 }}
        />
        <span
          className="pointer-events-none absolute -inset-1.5 rounded-[16px] border border-ion-400/30 animate-freq-ring"
          aria-hidden="true"
          style={{
            animationDelay: "1.4s",
            animationPlayState: "running",
            opacity: playing ? 1 : 0.3,
          }}
        />

        {/* ── housing ── */}
        <span className="node-housing absolute inset-0 overflow-hidden rounded-[12px] transition-[border-color,box-shadow] duration-300 group-hover:border-signal-400/60" />

        {/* ── board artwork ── */}
        <svg
          viewBox="0 0 80 104"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="nodeBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c2735" />
              <stop offset="42%" stopColor="#101823" />
              <stop offset="100%" stopColor="#060a10" />
            </linearGradient>
            <linearGradient id="nodeDie" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16202c" />
              <stop offset="55%" stopColor="#0a1017" />
              <stop offset="100%" stopColor="#05080c" />
            </linearGradient>
            <linearGradient id="nodePin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c3d3dd" />
              <stop offset="45%" stopColor="#7d93a3" />
              <stop offset="100%" stopColor="#46586a" />
            </linearGradient>
            <linearGradient id="nodePinV" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c3d3dd" />
              <stop offset="45%" stopColor="#7d93a3" />
              <stop offset="100%" stopColor="#46586a" />
            </linearGradient>
            <filter id="nodeGlow" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* silkscreen outline */}
          <rect x="5.5" y="5.5" width="69" height="93" rx="3" fill="none" stroke="#31465a" strokeWidth="0.9" />

          {/* routed copper traces from pins down to the indicator bank */}
          <g stroke="#10657f" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <path d="M10 36 V80 H20" />
            <path d="M10 50 V86 H20" />
            <path d="M10 64 V92 H20" />
            <path d="M70 36 V80 H60" />
            <path d="M70 50 V86 H60" />
            <path d="M70 64 V92 H60" />
            <path d="M26 96 H54" />
          </g>

          {/* travelling charge packet — live only while playing */}
          <g
            className={playing ? "animate-trace-packet" : ""}
            stroke="#5fdcf8"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
            filter="url(#nodeGlow)"
            style={{ animationPlayState: playing ? "running" : "paused", opacity: playing ? 1 : 0 }}
          >
            <path d="M10 36 V80 H20" strokeDasharray="9 200" />
            <path d="M70 64 V92 H60" strokeDasharray="9 200" style={{ animationDelay: "1.1s" }} />
          </g>

          {/* ── QFP package ── */}
          <g>
            {/* side leads, metallic */}
            <g stroke="url(#nodePin)" strokeWidth="2.4" strokeLinecap="butt">
              <path d="M17 34H9" />
              <path d="M17 42H9" />
              <path d="M17 50H9" />
              <path d="M17 58H9" />
              <path d="M17 66H9" />
              <path d="M63 34H71" />
              <path d="M63 42H71" />
              <path d="M63 50H71" />
              <path d="M63 58H71" />
              <path d="M63 66H71" />
            </g>
            {/* top / bottom leads */}
            <g stroke="url(#nodePinV)" strokeWidth="2.4" strokeLinecap="butt">
              <path d="M26 28V22" />
              <path d="M34 28V22" />
              <path d="M46 28V22" />
              <path d="M54 28V22" />
              <path d="M26 74V80" />
              <path d="M34 74V80" />
              <path d="M46 74V80" />
              <path d="M54 74V80" />
            </g>

            {/* moulded body with a bevel highlight along the top */}
            <rect x="16" y="27" width="48" height="48" rx="3" fill="url(#nodeBody)" stroke="#31424f" strokeWidth="1" />
            <rect x="16.8" y="27.8" width="46.4" height="46.4" rx="2.2" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />

            {/* die cavity */}
            <rect x="24" y="36" width="32" height="20" rx="1.5" fill="#04070b" stroke="#26333f" strokeWidth="0.8" />

            {/* die etch */}
            <text
              x="40"
              y="46"
              textAnchor="middle"
              fill="#5fdcf8"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize="7"
              fontWeight="700"
              letterSpacing="1.4"
              style={{ opacity: playing ? 1 : 0.7 }}
            >
              FZ26
            </text>

            {/* active die layer — brightens with playback */}
            <rect
              x="30"
              y="49"
              width="20"
              height="4"
              rx="0.8"
              fill="#22c8ec"
              className={playing ? "animate-die-breath" : ""}
              style={{ animationPlayState: playing ? "running" : "paused", opacity: playing ? 1 : 0.55 }}
            />

            {/* pin-1 dimple */}
            <circle cx="20" cy="31" r="1.2" fill="#4a5f70" />
          </g>

          {/* ── waveform / signal readout inside the module ── */}
          <g>
            {/* scope baseline + graticule ticks */}
            <rect x="14" y="80" width="52" height="13" rx="1.5" fill="#04070c" stroke="#1e2a35" strokeWidth="0.8" />
            <line x1="16" y1="86.5" x2="64" y2="86.5" stroke="#22c8ec" strokeOpacity="0.22" strokeWidth="0.7" strokeDasharray="2 3" />

            {/* resting trace */}
            <path
              d="M16 86.5 Q 21 84 24 86.5 T 32 86.5 T 40 86.5 T 48 86.5 T 56 86.5 T 64 86.5"
              fill="none"
              stroke="#22c8ec"
              strokeWidth="1"
              strokeLinecap="round"
              style={{ opacity: playing ? 0.3 : 0.6 }}
            />
            {/* live trace — dashed so the dash-offset scroll reads as flow */}
            <path
              d="M16 86.5 Q 21 80 24 86.5 T 32 86.5 T 40 86.5 T 48 86.5 T 56 86.5 T 64 86.5"
              fill="none"
              stroke="#5fdcf8"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="5 3"
              className={playing ? "animate-wave-scroll" : ""}
              style={{ animationPlayState: playing ? "running" : "paused", opacity: playing ? 1 : 0.45 }}
            />
            {/* travelling pulse head along the trace */}
            {playing && (
              <path
                d="M16 86.5 Q 21 80 24 86.5 T 32 86.5 T 40 86.5 T 48 86.5 T 56 86.5 T 64 86.5"
                fill="none"
                stroke="#ecfeff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="7 149"
                className="animate-wave-scroll"
                filter="url(#nodeGlow)"
              />
            )}
          </g>

          {/* ── indicator LED bank ── */}
          {/* 1 · carrier — blinks while playing, steady dim otherwise */}
          <circle
            cx="24"
            cy="96"
            r="2.8"
            fill="#22c8ec"
            filter="url(#nodeGlow)"
            className={playing ? "animate-led-blink" : ""}
            style={{ animationPlayState: playing ? "running" : "paused", opacity: playing ? 1 : 0.65 }}
          />
          {/* 2 · link */}
          <circle
            cx="40"
            cy="96"
            r="2.4"
            fill="#5b8dfb"
            filter="url(#nodeGlow)"
            className="animate-idle-breathe"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
          {/* 3 · power — always-on steady amber, like a real standby LED */}
          <circle cx="56" cy="96" r="2.4" fill="#fbbf24" opacity="0.95" filter="url(#nodeGlow)" />

          {/* mounting holes with countersink */}
          <g fill="#070b11" stroke="#3a4c5a" strokeWidth="0.9">
            <circle cx="40" cy="12" r="2.8" />
            <circle cx="11" cy="50" r="2.2" />
            <circle cx="69" cy="50" r="2.2" />
          </g>
        </svg>

        {/* etched nameplate — recessed into the housing, needs enough
            contrast to survive on top of the board artwork */}
        <span
          className="mono-label pointer-events-none absolute inset-x-0 bottom-0.5 text-center text-[7.5px] font-semibold tracking-[0.26em] text-signal-100"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.95)" }}
          aria-hidden="true"
        >
          NODE-26
        </span>

        {/* status readout above the module, on a HUD chip so it is legible
            against the page rather than floating as faint text */}
        <span
          className="mono-label pointer-events-none absolute -top-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-[4px] text-[9px] font-bold tracking-[0.2em] backdrop-blur-sm transition-colors duration-300"
          style={{
            color: playing ? "#c8f6ff" : "#dbe7f2",
            borderColor: playing ? "rgba(34,200,236,0.55)" : "rgba(148,163,184,0.45)",
            backgroundColor: playing ? "rgba(34,200,236,0.14)" : "rgba(6,10,18,0.94)",
            boxShadow: playing
              ? "0 0 16px -4px rgba(34,200,236,0.75), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 0 12px -6px rgba(34,200,236,0.45), 0 4px 12px -6px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          aria-hidden="true"
        >
          <span
            className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: playing ? "#5fdcf8" : "#94a3b8",
              boxShadow: playing
                ? "0 0 6px rgba(95,220,248,0.9)"
                : "0 0 5px rgba(148,163,184,0.5)",
            }}
          />
          {playing ? "MUSIC · LIVE" : "MUSIC · IDLE"}
        </span>

        {/* specular sheen across the top edge */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-200/40 to-transparent"
          aria-hidden="true"
        />

        <span className="sr-only">
          FREQUENZA signal node. {playing ? "Playing." : "Stopped."} Opens the music player.
        </span>
      </button>
    );
  }

  /* ── Expanded: signal control deck ──────────────────────────────────────── */
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex justify-end px-3 pb-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:px-0 sm:pb-0"
      role="dialog"
      aria-label="FREQUENZA '26 music player"
    >
      <div className="relative w-full overflow-hidden rounded-2xl border border-signal-400/25 bg-ink/85 shadow-[0_0_0_1px_rgba(34,200,236,0.08),0_30px_70px_-28px_rgba(0,0,0,1),0_0_40px_-22px_rgba(34,200,236,0.5)] backdrop-blur-2xl sm:w-[336px]">
        {/* PCB substrate */}
        <span className="pointer-events-none absolute inset-0 traces-fine opacity-60" aria-hidden="true" />
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,200,236,0.09),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(157,124,247,0.05),transparent_70%)]"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-70" aria-hidden="true" />

        {/* circuit corners + nodes */}
        <span className="circuit-corner left-2 top-2 border-l border-t" aria-hidden="true" />
        <span className="circuit-corner right-2 top-2 border-r border-t" aria-hidden="true" />
        <span className="circuit-corner bottom-2 left-2 border-b border-l" aria-hidden="true" />
        <span className="circuit-corner bottom-2 right-2 border-b border-r" aria-hidden="true" />
        <span className="pointer-events-none absolute left-3 top-3 h-1 w-1 rounded-full bg-signal-400" aria-hidden="true" />
        <span className="pointer-events-none absolute right-3 top-3 h-1 w-1 rounded-full bg-ion-400" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-3 left-3 h-1 w-1 rounded-full bg-plasma-400/70" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-3 right-3 h-1 w-1 rounded-full bg-signal-400/70" aria-hidden="true" />

        <div className="relative p-3 sm:p-3.5">
          {/* ── HUD header ── */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  fault
                    ? "bg-status-bad"
                    : playing
                      ? "bg-signal-400 animate-signal-ping"
                      : "bg-signal-600"
                }`}
                aria-hidden="true"
              />
              <span className="mono-label truncate text-signal-300/90">
                {fault ? "NO CARRIER" : playing ? "LIVE SIGNAL" : "STANDBY"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="mono-label hidden text-slate-500 sm:inline">
                CH-{String(index + 1).padStart(2, "0")}/{String(TRACKS.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close music player"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-void/60 text-slate-400 transition-colors hover:border-signal-400/40 hover:text-signal-200"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── Oscilloscope trace + spectrum ── */}
          <div className="relative mt-3 rounded-lg border border-white/[0.06] bg-void/50 px-2 pt-1.5">
            <svg
              viewBox="0 0 300 34"
              preserveAspectRatio="none"
              className="block h-8 w-full"
              aria-hidden="true"
            >
              <line x1="0" y1="17" x2="300" y2="17" stroke="#22c8ec" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 6" vectorEffect="non-scaling-stroke" />
              <path
                d="M0 17 Q 12 4 25 17 T 50 17 T 75 17 T 100 17 T 125 17 T 150 17 T 175 17 T 200 17 T 225 17 T 250 17 T 275 17 T 300 17"
                fill="none"
                stroke="#22c8ec"
                strokeOpacity={playing ? 0.85 : 0.3}
                strokeWidth="1.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke-opacity .3s ease" }}
              />
              <path
                d="M0 17 Q 12 4 25 17 T 50 17 T 75 17 T 100 17 T 125 17 T 150 17 T 175 17 T 200 17 T 225 17 T 250 17 T 275 17 T 300 17"
                fill="none"
                stroke="#a8ecfd"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="34 220"
                vectorEffect="non-scaling-stroke"
                className={playing ? "animate-scope-scroll" : "hidden"}
                style={{ filter: "drop-shadow(0 0 5px rgba(168,236,253,0.85))" }}
              />
            </svg>
            <div className="py-1">
              <SpectrumBars active={playing} />
            </div>
          </div>

          {/* ── Track readout ── */}
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-signal-400/25 bg-void/60">
              <Disc3
                className={`h-4 w-4 text-signal-300 ${playing ? "animate-spin-slow" : ""}`}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-[13px] font-bold uppercase leading-tight tracking-wide text-white">
                {track.title}
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                {track.artist}
              </p>
            </div>
          </div>

          {/* ── Seek ── */}
          <div className="mt-3">
            <div
              ref={seekRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={0}
              aria-valuetext="0:00"
              onPointerDown={onSeekPointerDown}
              onPointerMove={onSeekPointerMove}
              onPointerUp={endScrub}
              onPointerCancel={endScrub}
              onKeyDown={onSeekKeyDown}
              className="group relative flex h-6 cursor-pointer touch-none items-center"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true" />
              <span
                ref={fillRef}
                className="absolute inset-y-0 left-0 top-1/2 h-[3px] w-full -translate-y-1/2 origin-left scale-x-0 rounded-full bg-signal-gradient"
                style={{ transform: "scaleX(0)" }}
                aria-hidden="true"
              />
              <span
                ref={knobRef}
                className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-200/80 bg-void shadow-[0_0_10px_rgba(34,200,236,0.7)]"
                style={{ left: "0%" }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between font-mono text-[9px] tabular-nums text-slate-500">
              <span ref={elapsedRef}>0:00</span>
              <span ref={carrierRef} className="text-signal-400/70">
                88.5 MHz
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* ── Transport + volume ── */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevTrack}
                aria-label="Previous track"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-void/60 text-slate-300 transition-colors hover:border-signal-400/40 hover:text-signal-200"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playLabel}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-signal-400/45 bg-signal-400/12 text-signal-100 transition-all hover:border-signal-400/80 hover:bg-signal-400/20 hover:shadow-[0_0_20px_-6px_rgba(34,200,236,0.8)]"
              >
                {playing ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next track"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-void/60 text-slate-300 transition-colors hover:border-signal-400/40 hover:text-signal-200"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-void/60 text-slate-300 transition-colors hover:border-signal-400/40 hover:text-signal-200"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={onVolumeChange}
                aria-label="Volume"
                className="signal-range h-11 w-full min-w-0 max-w-[96px] cursor-pointer appearance-none bg-transparent"
              />
            </div>
          </div>

          {fault && (
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-status-bad/80">
              Signal fault — check /assets source
            </p>
          )}
        </div>
      </div>
    </div>
  );
}