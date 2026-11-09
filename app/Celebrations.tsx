"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Plus, X } from "lucide-react";
import "./celebrations.css";

const locationUrl = "https://maps.app.goo.gl/HBPk2KicALnd7gYG7";

const celebrations = [
  {
    id: "haldi",
    name: "Haldi",
    line: "Colour, laughter & a little sunshine.",
    day: "Wednesday",
    date: "2 December 2026",
    isoDate: "2026-12-02",
    time: "12:30 p.m. onwards",
    calendar: "/calendar/haldi.ics",
    colour: "#82591b",
    x: "25%",
    y: "30%",
  },
  {
    id: "sangeeth",
    name: "Sangeeth",
    line: "An evening of music & togetherness.",
    day: "Wednesday",
    date: "2 December 2026",
    isoDate: "2026-12-02",
    time: "6:00 p.m. onwards",
    calendar: "/calendar/sangeeth.ics",
    colour: "#645270",
    x: "77%",
    y: "29%",
  },
  {
    id: "muhurtham",
    name: "Muhurtham",
    line: "With love, with blessings, with you.",
    day: "Thursday",
    date: "3 December 2026",
    isoDate: "2026-12-03",
    time: "8:05 a.m. to 9:10 a.m.",
    note: "Dhanur Lagna",
    calendar: "/calendar/muhurtham.ics",
    colour: "#692e39",
    x: "25%",
    y: "61%",
  },
  {
    id: "reception",
    name: "Reception",
    subtitle: "& Beegara Outhana Koota",
    line: "A celebration to share with everyone we love.",
    day: "Sunday",
    date: "13 December 2026",
    isoDate: "2026-12-13",
    time: "Lunch: 12:30 p.m. onwards",
    calendar: "/calendar/reception.ics",
    colour: "#815a61",
    x: "77%",
    y: "64%",
  },
];

export default function Celebrations() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const event = selectedIndex === null ? null : celebrations[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [selectedIndex]);

  const isOpen = selectedIndex !== null;
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  function openCelebration(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelectedIndex(index);
  }

  function restoreFocus() {
    setSelectedIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }

  function closeFromBackdrop(click: MouseEvent<HTMLDialogElement>) {
    if (click.target !== click.currentTarget) return;
    const bounds = click.currentTarget.getBoundingClientRect();
    if (click.clientX < bounds.left || click.clientX > bounds.right || click.clientY < bounds.top || click.clientY > bounds.bottom) {
      click.currentTarget.close();
    }
  }

  function moveCelebration(direction: number) {
    setSelectedIndex((current) => current === null ? null : (current + direction + celebrations.length) % celebrations.length);
  }

  return (
    <section className="celebrations-story" id="celebrations" aria-labelledby="celebrations-title">
      <header className="celebrations-story-heading" data-reveal>
        <div className="chapter-mark"><span>03</span><i/><p>The wedding celebrations</p></div>
        <span className="celebrations-divider" aria-hidden="true">✦</span>
        <h2 id="celebrations-title">Moments to cherish</h2>
        <p>Join us for these celebrations with our families.</p>
      </header>

      <figure className="celebrations-courtyard" data-reveal>
        <div className="celebrations-artwork">
          <img
            src="/images/celebration-courtyard.webp"
            alt="An illustrated temple courtyard with four celebration pavilions, surrounded by gardens"
            width="1080"
            height="1440"
            loading="lazy"
            decoding="async"
          />
          {celebrations.map((celebration, index) => (
            <button
              className="celebration-hotspot"
              key={celebration.id}
              type="button"
              aria-label={`View ${celebration.name} details`}
              aria-haspopup="dialog"
              onClick={(click) => openCelebration(index, click.currentTarget)}
              style={{ "--hotspot-x": celebration.x, "--hotspot-y": celebration.y, "--event-colour": celebration.colour, "--pulse-delay": `${index * 0.45}s` } as CSSProperties}
            >
              <span className="celebration-hotspot-marker" aria-hidden="true"><Plus size={19} strokeWidth={1.5} /></span>
              <span className="celebration-hotspot-name">{celebration.name}</span>
            </button>
          ))}
        </div>
        <figcaption>Explore the pavilions for celebration details</figcaption>
      </figure>

      <section className="celebrations-schedule" aria-labelledby="celebrations-schedule-title">
        <h3 className="celebrations-schedule-heading" id="celebrations-schedule-title">Celebration schedule</h3>
        <ol>
          {celebrations.map((celebration, index) => (
            <li key={celebration.id}>
              <span className="schedule-number" aria-hidden="true">0{index + 1}</span>
              <div>
                <h4 className="schedule-event-name">{celebration.name}</h4>
                {celebration.subtitle && <p className="schedule-subtitle">{celebration.subtitle}</p>}
                <p className="schedule-date">{celebration.day && `${celebration.day}, `}{celebration.isoDate ? <time dateTime={celebration.isoDate}>{celebration.date}</time> : celebration.date}</p>
                <p>{celebration.time}</p>
                {celebration.note && <p className="schedule-note">{celebration.note}</p>}
                {celebration.calendar && <a className="schedule-calendar" href={celebration.calendar} download><CalendarDays size={14} aria-hidden="true" /> Add to calendar</a>}
              </div>
            </li>
          ))}
        </ol>
        <p className="schedule-venue">All celebrations at Suvidha Resort (Ajji Thota), Bengaluru.</p>
      </section>

      <p className="celebrations-timezone">All times are in India Standard Time.</p>

      <dialog
        ref={dialogRef}
        className="celebrations-dialog"
        aria-labelledby="celebration-dialog-title"
        aria-describedby="celebration-dialog-description"
        onClose={restoreFocus}
        onClick={closeFromBackdrop}
        style={{ "--event-colour": event?.colour ?? "#692e39" } as CSSProperties}
      >
        <div className="celebrations-dialog-inner">
          <button className="celebrations-dialog-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Close celebration details" autoFocus><X size={21} strokeWidth={1.5} /></button>
          {event && <>
            <div className="celebrations-dialog-details" key={event.id}>
              <p className="celebrations-dialog-kicker">With love, we invite you</p>
              <span className="celebrations-dialog-flower" aria-hidden="true">✦</span>
              <h3 id="celebration-dialog-title">{event.name}</h3>
              {event.subtitle && <p className="celebrations-dialog-subtitle">{event.subtitle}</p>}
              <p id="celebration-dialog-description" className="celebrations-dialog-description">{event.line}</p>
              <div className="celebrations-dialog-when">
                {event.day && <p className="celebrations-dialog-day">{event.day}</p>}
                {event.isoDate ? <time dateTime={event.isoDate}>{event.date}</time> : <p className="celebrations-dialog-pending">{event.date}</p>}
                <p className="celebrations-dialog-time">{event.time}</p>
                {event.note && <p className="celebrations-dialog-note">{event.note}</p>}
              </div>
              <div className="celebrations-dialog-where"><MapPin size={18} strokeWidth={1.4} aria-hidden="true" /><p>Suvidha Resort <span>(Ajji Thota)</span></p></div>
              <div className="celebrations-dialog-actions">
                {event.calendar && <a href={event.calendar} download className="celebrations-save"><CalendarDays size={16} aria-hidden="true" /> Add to calendar</a>}
                <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="celebrations-directions">Get directions <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
              <p className="celebrations-dialog-timezone">India Standard Time · Bengaluru</p>
            </div>
            <nav className="celebrations-dialog-pagination" aria-label="Browse celebrations">
              <button type="button" onClick={() => moveCelebration(-1)} aria-label="Previous celebration"><ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" /></button>
              <span aria-live="polite">0{(selectedIndex ?? 0) + 1} <i>/</i> 04</span>
              <button type="button" onClick={() => moveCelebration(1)} aria-label="Next celebration"><ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" /></button>
            </nav>
          </>}
        </div>
      </dialog>
    </section>
  );
}
