# Likitha & Jeevan — illustrated wedding invitation

A mobile-first invitation with doors that swing open followed by a camera move through the doorway, individual letter animation, a top-right day/night switch, decorative petals and lamp glow, a realistic flower rangoli around the wedding date, floral borders after every section, family scroll reveals, an interactive celebration courtyard, accessible event dialogs, directions and calendar downloads.

## Content

- Bride: Likitha S.; groom: Jeevan B.K.
- Haldi: 2 December 2026, 12:30 p.m. onwards.
- Sangeeth: 6:00 p.m. onwards. Date remains unconfirmed because the printed invitation gives no separate date.
- Muhurtham: 3 December 2026, 8:05–9:10 a.m.; Dhanur Lagna.
- Reception & Beegara Outhana Koota: 13 December 2026; lunch from 12:30 p.m.
- Venue: Suvidha Resort (Ajji Thota), Acharya College Main Road, Thammenahalli, Bengaluru 560107.
- Directions use the URL decoded from the supplied printed QR: https://maps.app.goo.gl/HBPk2KicALnd7gYG7
- The .ics files contain the supplied times, expressed in UTC, with no invented end time for Haldi or reception lunch.

## Illustration and media

The artwork files in public/images are original generated decorative illustrations. The courtyard is an imaginative setting, not an accurate site plan of the venue; the pavilion is not a depiction of the real resort. Both are described accordingly. The floral rangoli and slim jasmine dividers share the temple illustrations' warm, softly painted botanical detail, with ivory blossoms, muted gold flowers and olive leaves. Their backgrounds are transparent. Dividers are centered, at most 420px wide, with a 60px desktop/44px phone section height. The date remains accessible HTML on a plain center. Public hero and entrance artwork contain no embedded invitation text. Monograms intentionally stand on their own until the couple's pre-wedding photos are supplied.

Sound is optional, off by default and starts only after a user gesture. It is an original synthesized chime sequence using Web Audio, not a recording or a traditional instrumental track. Audio suspends when the document is hidden. There is no RSVP form without a configured response destination.

## Accessibility

Reduced-motion preferences suppress animation. The entrance keeps the underlying invitation inert until opened and transfers focus to the heading. Its transparent doorway reveals the actual hero painting while the gate moves beyond the viewport, without fading the architecture. Celebration panels and the sharing fallback use native modal dialogs, Escape/backdrop dismissal, and restored trigger focus. The full event schedule is also available as a semantic expandable section.

Share invitation opens the device's native share sheet when supported. Otherwise, a dialog offers WhatsApp, email and a copyable link. Opening the controls does not send a message or change the Site's audience; guest access still depends on the configured Site permissions.

## Development and hosting

Vinext starter and its Sites build integration are retained. Use the installed Sites helper for dependency installation, source synchronization, builds, packaging and deployment. Preserve the existing project ID and audience. Keep temporary responsive-review pages out of production.

Local font files include their original license notices. Code and project imagery are persisted through this Site's source repository.
