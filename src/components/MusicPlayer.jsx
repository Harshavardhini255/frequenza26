import { useEffect, useRef, useState } from "react";
import { Activity, Disc3, Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X, Waves } from "lucide-react";

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

const WaveformBars = ({ playing }) => {
  const bars = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden="true">
      {bars.map((b) => (
        <span
          key={b}
          className="w-[3px] rounded-t-[1px] bg-signal-400/70"
          style={{
            height: playing ? `${16 + ((b * 7) % 10)}%` : "20%",
            opacity: playing ? 0.7 + ((b * 3) % 5) * 0.06 : 0.35,
            animation: playing ? `eqBar ${0.9 + (b % 7) * 0.17}s ease-in-out ${(b % 9) * 0.09}s infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
};

export default function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  const track = TRACKS[index] || TRACKS[0];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const update = () => {
      if (isFinite(a.duration)) setDuration(a.duration);
      setProgress(a.currentTime);
    };
    const onEnd = () => next();
    a.addEventListener("timeupdate", update);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", update);
      a.removeEventListener("ended", onEnd);
    };
  }, [index]);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const togglePlay = () => (playing ? pause() : play());

  const next = () => {
    const nextIdx = (index + 1) % TRACKS.length;
    setIndex(nextIdx);
    setTimeout(() => play(), 50);
  };

  const prev = () => {
    const prevIdx = (index - 1 + TRACKS.length) % TRACKS.length;
    setIndex(prevIdx);
    setTimeout(() => play(), 50);
  };

  const onSeek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const val = Number(e.target.value);
    a.currentTime = val;
    setProgress(val);
  };

  const onVol = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    setMuted(val === 0);
  };

  const format = (t) => {
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="metadata" />
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed bottom-4 left-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full border border-signal-400/40 bg-void/80 text-signal-200 shadow-[0_0_30px_-10px_rgba(34,200,236,0.8)] backdrop-blur-xl transition-all hover:border-signal-400/70 hover:shadow-[0_0_40px_-6px_rgba(34,200,236,0.9)] lg:bottom-6 lg:left-6"
          aria-label="Open music player"
        >
          <span className="absolute inset-0 rounded-full border border-dashed border-signal-400/30" aria-hidden="true" />
          <span className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-signal-300 animate-pulse" aria-hidden="true" />
          <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-ion-400 animate-pulse" aria-hidden="true" />
          <Disc3 className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 left-4 z-[9999] w-[calc(100%-2rem)] max-w-[340px] lg:bottom-6 lg:left-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink/90 p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)] backdrop-blur-xl">
            <span className="absolute inset-0 traces-faint opacity-25" aria-hidden="true" />
            <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
            <span className="circuit-corner left-2 top-2 border-l border-t" />
            <span className="circuit-corner right-2 top-2 border-r border-t" />
            <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-signal-400" aria-hidden="true" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-ion-400" aria-hidden="true" />
            <span className="absolute left-1 bottom-1 h-1.5 w-1.5 rounded-full bg-plasma-400" aria-hidden="true" />
            <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-signal-400" aria-hidden="true" />
            <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,200,236,0.08),transparent_70%)]" aria-hidden="true" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-signal-400/30 bg-void/70">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" className="text-signal-300">
                      <path d="M2 4h8M2 8h10M2 12h6" />
                    </g>
                    <g fill="currentColor" className="text-signal-400">
                      <circle cx="11" cy="4" r="1" />
                      <circle cx="9" cy="12" r="1" />
                    </g>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-wide text-white">
                    <span>{track.title}</span>
                    {playing && <Activity className="h-3 w-3 animate-pulse text-signal-400" />}
                  </div>
                  <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                    {track.artist}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/6 bg-void/60 p-1.5 text-slate-400 transition-colors hover:text-slate-200"
                aria-label="Close music player"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative mt-2">
              <WaveformBars playing={playing} />
            </div>

            <div className="relative mt-2">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.01}
                value={progress}
                onChange={onSeek}
                className="w-full accent-signal-400"
              />
              <div className="mt-0.5 flex justify-between font-mono text-[9px] text-slate-500">
                <span>{format(progress)}</span>
                <span>{format(duration)}</span>
              </div>
            </div>

            <div className="relative mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prev}
                  className="rounded-lg border border-white/8 bg-void/60 p-2 text-slate-300 transition-colors hover:text-signal-200"
                  aria-label="Previous track"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-lg border border-signal-400/40 bg-signal-400/10 p-2 text-signal-200 transition-all hover:border-signal-400/70 hover:bg-signal-400/20"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-lg border border-white/8 bg-void/60 p-2 text-slate-300 transition-colors hover:text-signal-200"
                  aria-label="Next track"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="rounded-lg border border-white/8 bg-void/60 p-2 text-slate-300 transition-colors hover:text-signal-200"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={onVol}
                  className="hidden w-16 accent-signal-400 sm:block"
                />
                <Waves className="h-3 w-3 text-signal-400 opacity-60" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
