"use client";

import { useEffect, useState } from "react";
import "./wedding-countdown.css";

export const WEDDING_START = "2026-12-03T08:05:00+05:30";
const weddingTime = Date.parse(WEDDING_START);

export function getWeddingCountdown(now: number) {
  const totalSeconds = Math.max(0, Math.ceil((weddingTime - now) / 1000));
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

type Countdown = ReturnType<typeof getWeddingCountdown>;

export default function WeddingCountdown() {
  // The static HTML and first client render both show placeholders. The clock
  // begins after hydration, so a cached build never displays a stale countdown.
  const [remaining, setRemaining] = useState<Countdown | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      const next = getWeddingCountdown(Date.now());
      setRemaining(next);
      if (next.totalSeconds === 0 && interval !== undefined) clearInterval(interval);
      return next;
    };
    if (update().totalSeconds > 0) interval = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      if (interval !== undefined) clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const hasArrived = remaining?.totalSeconds === 0;
  const units = [
    { key: "days", label: "Days" },
    { key: "hours", label: "Hours" },
    { key: "minutes", label: "Minutes" },
    { key: "seconds", label: "Seconds" },
  ] as const;

  return <section className="wedding-countdown" aria-labelledby="wedding-countdown-title">
    <p className="wedding-countdown-kicker">With every passing moment</p>
    <h2 id="wedding-countdown-title">{hasArrived ? "Our wedding day has arrived." : "Until our wedding begins"}</h2>
    <time className="wedding-countdown-date" dateTime={WEDDING_START}>3 December 2026 · 8:05 a.m. IST</time>
    {hasArrived ? <p className="wedding-countdown-arrived">The wait is over. Thank you for being part of our celebration.</p> : <dl className="wedding-countdown-clock" aria-live="off">
      {units.map(({ key, label }) => <div className="wedding-countdown-unit" key={key}>
        <dt>{label}</dt>
        <dd>{remaining ? String(remaining[key]).padStart(2, "0") : "—"}</dd>
      </div>)}
    </dl>}
  </section>;
}
