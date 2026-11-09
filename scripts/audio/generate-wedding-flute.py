#!/usr/bin/env python3
"""Render the invitation's original flute-style loop without external samples.

Requires Python 3, NumPy, SciPy, and FFmpeg. Run from any working directory:
    python3 scripts/audio/generate-wedding-flute.py

The score and every instrument are synthesized here. This is an original
pentatonic melody with a bamboo-flute-inspired timbre and a soft plucked drone,
not a recording of a performer or a rendition of an existing song.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile


ROOT = Path(__file__).resolve().parents[2]
RATE = 44100
BPM = 76
BEAT = 60 / BPM
BEATS = 64
SAMPLES = round(BEATS * BEAT * RATE)
RNG = np.random.default_rng(20261203)

# A newly composed sixteen-bar phrase. Numbers are MIDI pitches; None is a
# breathing space. The D/E/F#/A/B pitch collection keeps the melody open and warm.
SCORE = [
    [(62, 1), (64, .5), (66, .5), (69, 1), (66, 1)],
    [(64, 1), (66, .5), (64, .5), (62, 1.5), (None, .5)],
    [(66, 1), (69, .5), (71, .5), (74, 1), (71, 1)],
    [(69, 1), (66, 1), (64, .5), (66, .5), (62, .75), (None, .25)],
    [(64, .5), (66, .5), (69, 1.25), (71, .5), (69, .75), (None, .5)],
    [(66, 1.5), (64, .5), (62, 1.5), (None, .5)],
    [(69, .5), (71, .5), (74, 1), (76, .5), (74, .5), (71, 1)],
    [(69, 2), (66, .5), (64, .5), (None, 1)],
    [(74, 1.25), (71, .5), (69, .75), (66, 1), (None, .5)],
    [(69, .5), (71, .5), (74, .75), (76, .5), (78, .75), (76, .5), (74, .5)],
    [(71, 1), (69, .5), (66, .5), (64, 1), (66, .5), (None, .5)],
    [(69, 1.5), (66, .5), (64, .5), (62, 1), (None, .5)],
    [(62, .5), (64, .5), (66, 1.5), (69, .5), (71, .5), (69, .5)],
    [(66, .75), (69, .25), (71, .5), (74, .5), (71, .75), (69, .75), (66, .5)],
    [(64, 1), (66, .5), (69, .5), (66, .75), (64, .75), (None, .5)],
    [(62, 2.75), (None, 1.25)],
]


def hz(midi: float) -> float:
    return 440 * 2 ** ((midi - 69) / 12)


def smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def filtered_noise(count: int, low: float, high: float) -> np.ndarray:
    noise = RNG.standard_normal(count + 2048)
    sos = signal.butter(3, [low, high], btype="bandpass", fs=RATE, output="sos")
    noise = signal.sosfilt(sos, noise)[2048:]
    return noise / max(float(np.sqrt(np.mean(noise * noise))), 1e-9)


def flute(midi: int, held: float, previous: int | None, index: int) -> np.ndarray:
    release = min(.16, held * .3)
    count = round((held + release) * RATE)
    t = np.arange(count) / RATE
    attack = .045 + .012 * (index % 3)
    envelope = smoothstep(t / attack) * (1 - smoothstep((t - held) / release))
    envelope *= .93 + .05 * np.sin(np.pi * np.clip(t / held, 0, 1))

    # Breathing, delayed vibrato, and small pitch gestures prevent an organ-like
    # constant tone. Delicate grace slides stay subordinate to the main pitch.
    cents = 9.5 * np.sin(2 * np.pi * (4.9 + .08 * (index % 4)) * t + .4)
    cents *= smoothstep((t - .17) / .3)
    cents += 1.6 * np.sin(2 * np.pi * .73 * t + index)
    cents -= 17 * np.exp(-t / .055)
    if previous is not None and index % 4 == 2:
        approach = np.clip((previous - midi) * 100, -185, 185)
        cents += approach * (1 - smoothstep(t / .082))
    if held > .75 and index % 6 == 3:
        cents += 34 * np.sin(2 * np.pi * 2.2 * t) * np.exp(-t / .25)
    frequency = hz(midi) * 2 ** (cents / 1200)
    phase = np.cumsum(frequency) * (2 * np.pi / RATE)

    # Most acoustic-flute energy is in the fundamental. Quiet upper harmonics
    # and shaped air noise give the soft, hollow body and breath of the tone.
    tone = np.sin(phase)
    tone += (.19 + .035 * smoothstep(t / .11)) * np.sin(2 * phase + .14)
    tone += .052 * np.sin(3 * phase + .35)
    tone += .020 * np.sin(4 * phase + .2)
    tone += .009 * np.sin(5 * phase)
    air = filtered_noise(count, 1050, 6700)
    breath = .014 + .026 * np.exp(-t / .065)
    amplitude = .24 * (.91 + .09 * np.sin(index * 1.37 + .5))
    amplitude *= 1 - .012 * max(0, midi - 74)
    return amplitude * envelope * (tone + breath * air)


def drone(midi: int, index: int) -> np.ndarray:
    seconds = 6.0
    t = np.arange(round(seconds * RATE)) / RATE
    fundamental = hz(midi)
    wave = np.zeros_like(t)
    for partial in range(1, 13):
        amplitude = .60 / partial ** 1.32
        decay = np.exp(-t / (2.1 / (partial ** .15)))
        shimmer = .035 * np.sin(2 * np.pi * (.23 + partial * .013) * t + index)
        wave += amplitude * decay * np.sin(2 * np.pi * fundamental * partial * t + shimmer)
    envelope = smoothstep(t / .028) * (1 - smoothstep((t - 5.6) / .4))
    return wave * envelope * .028


def add_wrap(destination: np.ndarray, source: np.ndarray, start: int) -> None:
    # Wrapped tails make the waveform periodic, including across the loop join.
    indices = (np.arange(len(source)) + start) % len(destination)
    np.add.at(destination, indices, source)


def room_ir(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    t = np.arange(round(1.55 * RATE)) / RATE
    tail = signal.sosfilt(signal.butter(2, 5600, fs=RATE, output="sos"), rng.standard_normal(len(t)))
    tail *= np.exp(-4.2 * t) * smoothstep((t - .055) / .045)
    tail /= np.sqrt(np.sum(tail * tail))
    ir = .15 * tail
    for seconds, level in [(.037, .065), (.071, .045), (.113, .025)]:
        ir[round(seconds * RATE)] += level
    return ir


def circular_reverb(mono: np.ndarray, ir: np.ndarray) -> np.ndarray:
    return np.fft.irfft(np.fft.rfft(mono) * np.fft.rfft(ir, n=len(mono)), n=len(mono))


def compose() -> np.ndarray:
    lead = np.zeros(SAMPLES, dtype=np.float64)
    bed = np.zeros(SAMPLES, dtype=np.float64)
    beat = .12
    previous = None
    index = 0
    for bar_index, bar in enumerate(SCORE):
        assert abs(sum(length for _, length in bar) - 4) < 1e-8
        for midi, length in bar:
            if midi is not None:
                # Small, deterministic timing/dynamic variation gives every
                # repeated pitch an independent breath without losing the pulse.
                drift = .008 * np.sin(index * 1.8)
                held = max(.13, length * BEAT - .055)
                note = flute(midi, held, previous, index)
                add_wrap(lead, note, round((beat * BEAT + drift) * RATE))
                previous = midi
                index += 1
            else:
                previous = None
            beat += length

    for i in range(BEATS):
        midi = [45, 50, 50, 38][i % 4]
        add_wrap(bed, drone(midi, i), round((i + .20) * BEAT * RATE))

    mono = lead + bed
    left = mono + circular_reverb(mono, room_ir(23))
    right = mono + circular_reverb(mono, room_ir(61))
    stereo = np.stack([left, right], axis=1)
    # This gain avoids intermediate PCM clipping. Final perceived loudness and
    # true-peak limiting are applied by FFmpeg to the complete rendered score.
    stereo *= .70 / max(float(np.max(np.abs(stereo))), 1e-9)
    return stereo


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "public/audio/wedding-flute.mp3")
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="wedding-flute-") as tmp:
        dry_path = Path(tmp) / "original-flute-loop.wav"
        wavfile.write(dry_path, RATE, np.round(compose() * 32767).astype(np.int16))
        run = subprocess.run([
            "ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(dry_path),
            "-af", "loudnorm=I=-18:TP=-2:LRA=8:print_format=json",
            "-ar", str(RATE), "-c:a", "libmp3lame", "-b:a", "160k",
            "-metadata", "title=Courtyard Flute",
            "-metadata", "comment=Original synthesized flute-style melody and drone for the wedding invitation.",
            str(args.output),
        ], text=True, capture_output=True, check=True)
        print(run.stderr[run.stderr.rfind("{\n"):].strip())
    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-i", str(args.output), "-t", "14", "-c:a", "pcm_s16le", str(args.preview),
        ], check=True)
    print(json.dumps({"file": str(args.output), "bytes": args.output.stat().st_size,
                      "duration_seconds": SAMPLES / RATE, "bpm": BPM,
                      "source": "Original score and synthesis; no external samples or recordings."}))


if __name__ == "__main__":
    main()
