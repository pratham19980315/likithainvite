"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Music2, Volume2, VolumeX } from "lucide-react";
import "./invitation-music.css";

type MusicGraph = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
};

export default function InvitationMusic() {
  const volumeId = useId();
  const statusId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<MusicGraph | null>(null);
  const mountedRef = useRef(true);
  const wantsMusicRef = useRef(false);
  const requestRef = useRef(0);
  const volumeRef = useRef(0.75);
  const [wanted, setWanted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [error, setError] = useState("");

  const failPlayback = useCallback((message: string) => {
    if (!mountedRef.current) return;
    wantsMusicRef.current = false;
    requestRef.current += 1;
    audioRef.current?.pause();
    setWanted(false);
    setPlaying(false);
    setStarting(false);
    setError(message);
  }, []);

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    // Created only after a tap: no autoplay, preload request, or duplicate
    // media-source attachment during React's development effect replay.
    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.src = "/audio/wedding-flute.mp3";
    audio.onplaying = () => {
      if (!mountedRef.current || !wantsMusicRef.current || document.hidden) {
        audio.pause();
        return;
      }
      if (!graphRef.current || graphRef.current.context.state === "running") {
        setPlaying(true);
        setStarting(false);
      }
    };
    audio.onwaiting = () => {
      if (mountedRef.current && wantsMusicRef.current && !document.hidden) {
        setPlaying(false);
        setStarting(true);
      }
    };
    audio.onpause = () => {
      if (!mountedRef.current || !audio.paused) return;
      setPlaying(false);
      setStarting(false);
      // A pause from browser/OS controls also cancels future auto-resume.
      // Pausing a hidden tab preserves the visitor's playback choice.
      if (!document.hidden && wantsMusicRef.current) {
        wantsMusicRef.current = false;
        requestRef.current += 1;
        setWanted(false);
      }
    };
    audio.onerror = () => failPlayback("Music couldn't load. Tap to try again.");
    audioRef.current = audio;
    return audio;
  }, [failPlayback]);

  const playMusic = useCallback(async () => {
    if (!mountedRef.current || !wantsMusicRef.current || document.hidden) return;
    const request = ++requestRef.current;
    setStarting(true);
    setError("");

    try {
      const audio = getAudio();
      if (audio.error) audio.load();

      if (!graphRef.current) {
        const AudioCtor = window.AudioContext || (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;
        if (AudioCtor) {
          const context = new AudioCtor();
          try {
            const gain = context.createGain();
            gain.gain.value = volumeRef.current;
            gain.connect(context.destination);
            const source = context.createMediaElementSource(audio);
            source.connect(gain);
            graphRef.current = { context, source, gain };
          } catch (cause) {
            void context.close().catch(() => {});
            throw cause;
          }
        }
      }

      const graph = graphRef.current;
      // A GainNode also provides a real volume control on iOS, where the
      // media element's volume property may be ignored.
      audio.volume = graph ? 1 : volumeRef.current;
      // Start both calls before awaiting, preserving the tap's user gesture.
      const resume = graph ? graph.context.resume() : Promise.resolve();
      const play = audio.play();
      await Promise.all([resume, play]);
      if (!mountedRef.current || request !== requestRef.current) return;
      if (!wantsMusicRef.current || document.hidden) {
        audio.pause();
        return;
      }
      setStarting(false);
      setPlaying(!audio.paused);
    } catch {
      if (mountedRef.current && request === requestRef.current) {
        failPlayback("Music couldn't start. Tap to try again.");
      }
    }
  }, [failPlayback, getAudio]);

  function toggleMusic() {
    if (wantsMusicRef.current) {
      wantsMusicRef.current = false;
      requestRef.current += 1;
      setWanted(false);
      setPlaying(false);
      setStarting(false);
      setError("");
      audioRef.current?.pause();
      const context = graphRef.current?.context;
      if (context?.state === "running") void context.suspend().catch(() => {});
      return;
    }
    wantsMusicRef.current = true;
    setWanted(true);
    void playMusic();
  }

  function changeVolume(nextVolume: number) {
    const level = Math.min(1, Math.max(0, nextVolume));
    volumeRef.current = level;
    setVolume(level);
    const graph = graphRef.current;
    if (graph) graph.gain.gain.setTargetAtTime(level, graph.context.currentTime, 0.025);
    else if (audioRef.current) audioRef.current.volume = level;
  }

  useEffect(() => {
    mountedRef.current = true;
    const onVisibility = () => {
      if (document.hidden) {
        requestRef.current += 1;
        audioRef.current?.pause();
        setPlaying(false);
        setStarting(false);
        const context = graphRef.current?.context;
        if (context?.state === "running") void context.suspend().catch(() => {});
      } else if (wantsMusicRef.current) {
        void playMusic();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mountedRef.current = false;
      wantsMusicRef.current = false;
      requestRef.current += 1;
      document.removeEventListener("visibilitychange", onVisibility);
      const audio = audioRef.current;
      audioRef.current = null;
      if (audio) {
        audio.onplaying = null;
        audio.onwaiting = null;
        audio.onpause = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      const graph = graphRef.current;
      graphRef.current = null;
      if (graph) {
        graph.source.disconnect();
        graph.gain.disconnect();
        if (graph.context.state !== "closed") void graph.context.close().catch(() => {});
      }
    };
  }, [playMusic]);

  const percent = Math.round(volume * 100);
  return <div className={`invitation-music ${playing ? "is-playing" : ""}`} role="group" aria-label="Invitation music">
    <div className="invitation-music-pill">
      <button
        className="invitation-music-toggle"
        type="button"
        onClick={toggleMusic}
        aria-pressed={wanted}
        aria-label={wanted ? "Pause traditional flute music" : "Play traditional flute music"}
        aria-describedby={error ? statusId : undefined}
      >
        {wanted ? <Music2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        <span>{starting ? "Starting…" : wanted ? "Flute on" : error ? "Try music" : "Flute music"}</span>
      </button>
      {wanted && <div className="invitation-music-volume">
        <label htmlFor={volumeId}>
          <Volume2 size={13} aria-hidden="true" />
          <span className="invitation-music-sr-only">Flute music volume</span>
        </label>
        <input
          id={volumeId}
          type="range"
          min="0"
          max="100"
          step="1"
          value={percent}
          aria-valuetext={`${percent} percent`}
          onChange={(event) => changeVolume(Number(event.currentTarget.value) / 100)}
        />
        <output htmlFor={volumeId} aria-hidden="true">{percent}%</output>
      </div>}
    </div>
    <p className="invitation-music-status" id={statusId} role="status" aria-live="polite">{error}</p>
  </div>;
}
