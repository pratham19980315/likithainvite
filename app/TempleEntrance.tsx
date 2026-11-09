"use client";

import { ArrowUpRight } from "lucide-react";
import {
  type AnimationEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "./temple-entrance.css";

type TempleEntranceProps = {
  onEntered: () => void;
};

type CameraStyle = CSSProperties & {
  "--camera-origin-x"?: string;
  "--camera-origin-y"?: string;
  "--camera-x"?: string;
  "--camera-y"?: string;
  "--camera-scale"?: number;
};

const CAMERA_ANIMATION = "temple-entry-walk-through";

export default function TempleEntrance({ onEntered }: TempleEntranceProps) {
  const maskId = `temple-entry-mask-${useId().replace(/:/g, "")}`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onEntered);
  const completedRef = useRef(false);
  const startedRef = useRef(false);
  const fallbackRef = useRef<number | null>(null);
  const [opening, setOpening] = useState(false);
  const [cameraStyle, setCameraStyle] = useState<CameraStyle>({});

  useEffect(() => {
    callbackRef.current = onEntered;
  }, [onEntered]);

  useEffect(
    () => () => {
      if (fallbackRef.current !== null) {
        window.clearTimeout(fallbackRef.current);
      }
    },
    [],
  );

  const finishEntering = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    callbackRef.current();
  }, []);

  function openInvitation() {
    if (startedRef.current) return;
    startedRef.current = true;

    // A restored scroll position or section hash must still enter at the hero.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishEntering();
      return;
    }

    const viewport = viewportRef.current?.getBoundingClientRect();
    const portal = portalRef.current?.getBoundingClientRect();
    if (!viewport || !portal || !portal.width || !portal.height) {
      finishEntering();
      return;
    }

    const portalCenterX = portal.left + portal.width / 2 - viewport.left;
    const portalCenterY = portal.top + portal.height / 2 - viewport.top;

    // Move the doorway's centre to the viewer, then enlarge its open aperture
    // beyond every viewport edge. The invitation itself stays still behind it.
    setCameraStyle({
      "--camera-origin-x": `${portalCenterX}px`,
      "--camera-origin-y": `${portalCenterY}px`,
      "--camera-x": `${viewport.width / 2 - portalCenterX}px`,
      "--camera-y": `${viewport.height / 2 - portalCenterY}px`,
      "--camera-scale":
        Math.max(viewport.width / portal.width, viewport.height / portal.height) * 1.18,
    });
    setOpening(true);
    // Covers interrupted CSS animation events without leaving a locked page.
    fallbackRef.current = window.setTimeout(finishEntering, 3300);
  }

  function onCameraAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (
      event.target === event.currentTarget &&
      event.animationName === CAMERA_ANIMATION
    ) {
      finishEntering();
    }
  }

  return (
    <div
      ref={viewportRef}
      className={`temple-entry${opening ? " temple-entry-is-opening" : ""}`}
      role="region"
      aria-label="Welcome to Likitha and Jeevan's wedding invitation"
      aria-busy={opening}
    >
      <div
        className="temple-entry-camera"
        style={cameraStyle}
        onAnimationEnd={onCameraAnimationEnd}
      >
        <div className="temple-entry-frame">
          <svg
            className="temple-entry-architecture"
            viewBox="0 0 1080 1727"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="-10000"
                y="-10000"
                width="21080"
                height="21727"
                style={{ maskType: "luminance" }}
              >
                <rect x="-10000" y="-10000" width="21080" height="21727" fill="white" />
                <rect x="267.84" y="759.88" width="542.16" height="756.426" fill="black" />
              </mask>
            </defs>
            <g mask={`url(#${maskId})`}>
              <rect x="-10000" y="-10000" width="21080" height="21727" fill="#eee8d9" />
              <image href="/images/temple-entrance.webp" x="0" y="0" width="1080" height="1727" />
            </g>
          </svg>

          <div ref={portalRef} className="temple-entry-portal" aria-hidden="true">
            <div className="temple-entry-leaf temple-entry-leaf-left" />
            <div className="temple-entry-leaf temple-entry-leaf-right" />
          </div>

          <div className="temple-entry-copy">
            <p className="temple-entry-kicker">A celebration of love</p>
            <p className="temple-entry-initials" aria-label="Likitha and Jeevan">
              L <span>&amp;</span> J
            </p>
            <p className="temple-entry-date">03 · 12 · 2026</p>
            <button type="button" onClick={openInvitation} disabled={opening}>
              <span>Open invitation</span>
              <ArrowUpRight size={16} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="temple-entry-caption">A lifetime of love begins here</p>
        <span className="temple-entry-side temple-entry-side-left" aria-hidden="true">With love</span>
        <span className="temple-entry-side temple-entry-side-right" aria-hidden="true">With blessings</span>
      </div>
    </div>
  );
}
