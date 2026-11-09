# Likitha & Jeevan — illustrated wedding invitation

A mobile-first invitation with doors that swing open followed by a camera move through the doorway, animated full-name reveals, a top-right day/night switch, decorative petals and lamp glow, a realistic flower rangoli around the wedding date, floral borders after every section, family scroll reveals, a visible event schedule, an interactive celebration courtyard, accessible event dialogs, directions, calendar downloads and a wedding countdown.

## Content

- Bride: Likitha S.; groom: Jeevan B.K.
- Haldi: 2 December 2026, 12:30 p.m. onwards.
- Sangeeth: 2 December 2026, 6:00 p.m. onwards, on the same day as Haldi.
- Muhurtham: 3 December 2026, 8:05–9:10 a.m.; Dhanur Lagna.
- Reception & Beegara Outhana Koota: 13 December 2026; lunch from 12:30 p.m.
- Venue: Suvidha Resort (Ajji Thota), Acharya College Main Road, Thammenahalli, Bengaluru 560107.
- Directions use the URL decoded from the supplied printed QR: https://maps.app.goo.gl/HBPk2KicALnd7gYG7
- The .ics files contain the supplied times, expressed in UTC, with no invented end time for Haldi, Sangeeth or reception lunch.

## Illustration and media

The artwork files in public/images are original generated decorative illustrations. The courtyard is an imaginative setting, not an accurate site plan of the venue; the pavilion is not a depiction of the real resort. Both are described accordingly. The floral rangoli and slim jasmine dividers share the temple illustrations' warm, softly painted botanical detail, with ivory blossoms, muted gold flowers and olive leaves. Their backgrounds are transparent. Dividers are centered, at most 420px wide, with a 60px desktop/44px phone section height. The date remains accessible HTML on a plain center. Public hero and entrance artwork contain no embedded invitation text. Monograms intentionally stand on their own until the couple's pre-wedding photos are supplied.

Music is optional, off by default and starts only after a user gesture. The soundtrack is an original synthesized flute-style melody with a soft tonic/fifth drone, served locally from `public/audio/wedding-flute.mp3`. It starts at 75% volume and has a compact volume slider; a Web Audio gain control supports volume adjustment on mobile browsers as well. The roughly 51-second stereo track loops with a smooth join, pauses when the document is hidden, and resumes only if the visitor has left music enabled. The reproducible generator is `scripts/audio/generate-wedding-flute.py`; no third-party recordings or samples are used. There is no RSVP form without a configured response destination.

## Accessibility

Reduced-motion preferences suppress animation. The entrance keeps the underlying invitation inert until opened and transfers focus to the heading. Its transparent doorway reveals the actual hero painting while the gate moves beyond the viewport, without fading the architecture. Names animate as complete text runs so italic strokes and natural kerning stay intact. Important labels, times, family names and the address use larger, darker text for phone readability. Celebration panels and the sharing fallback use native modal dialogs, Escape/backdrop dismissal, and restored trigger focus. The full four-event schedule is visible above the courtyard illustration, so dates and times do not require a tap to discover.

The bottom countdown targets the Muhurtham start, 3 December 2026 at 8:05 a.m. India Standard Time. It initializes after hydration, updates against the fixed timestamp, stops at zero and does not announce every second to screen readers.

Social previews use `public/images/og-wedding-landscape.jpg`, a purpose-composed 1200 × 630 temple-themed card with centered names and date. Open Graph and Twitter large-image metadata share this landscape asset. Its image-generation prompt is recorded in `scripts/assets/og-wedding-landscape-prompt.txt`.

Share invitation opens the device's native share sheet when supported. Otherwise, a dialog offers WhatsApp, email and a copyable link. Opening the controls does not send a message or change the Site's audience; guest access still depends on the configured Site permissions.

## Vercel deployment

The repository's `vercel.json` selects Next.js and runs `npx next build`. This creates the `.next` output that Vercel expects. The ordinary `npm run build` command remains the Vinext/Sites build and is not the Vercel build command.

In Vercel, use the Next.js framework preset, the repository root as Root Directory, and the default Output Directory (leave its override disabled). If configuring the build through the dashboard instead of `vercel.json`, set Build Command to `npx next build`. Keep Install Command at its default. Redeploy after changing the configuration.

Share invitation uses the address where the visitor opened the invitation. Canonical and Open Graph URLs use Vercel's production domain when its system environment variables are available. To set a particular production domain explicitly, configure `NEXT_PUBLIC_SITE_URL` to its complete HTTPS URL and redeploy. Outside Vercel, the existing Sites domain remains the metadata fallback.

For a local Vercel-style production check, run `npx next build`, then `npx next start`.

## Development and hosting

Vinext starter and its Sites build integration are retained. Use the installed Sites helper for dependency installation, source synchronization, builds, packaging and deployment. Preserve the existing project ID and audience. Keep temporary responsive-review pages out of production.

Local font files include their original license notices. Code and project imagery are persisted through this Site's source repository.
