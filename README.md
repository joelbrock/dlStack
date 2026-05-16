# dlstack

A hand-built, file-driven personal link index. Drop it on any shared host
via SFTP — no build step, no framework, no database. To update the page,
edit `data/links.json` and re-upload.

Live at <https://www.joelbrock.org>.

## Setup

The repo ships with `data/links.example.json` (Ada Lovelace placeholder
data). The app reads `data/links.json` first, and falls back to the
example if there's no real file — so a fresh clone renders immediately.

To customize:

```bash
cp data/links.example.json data/links.json
# edit data/links.json — your real content
```

`data/links.json` is gitignored, so your personal content stays out of
the public repo. Upload `data/links.json` to your host alongside the
other files when you deploy.

## File layout

```
dlstack/
├── index.html                  shell + font preloads + no-flash boot script
├── favicon.svg                 the dL mark, ink/paper adaptive
├── data/
│   ├── links.example.json      committed example — used as fallback
│   └── links.json              your real content (gitignored)
└── assets/
    ├── css/
    │   ├── styles.css          editorial template (default)
    │   └── swiss.css           swiss template (overrides, scoped)
    └── js/
        └── app.js              loader + renderers
```

Total payload: ~40 KB across all assets (uncompressed). Gzipped: ~12 KB.

## Deploying

Upload the whole directory via SFTP/FTP to the web root of any shared host.
That's it — no PHP, no Node, no DB.

To update content: edit `data/links.json` locally, upload, done.

If you're behind Cloudflare during active development, enable
**Caching → Configuration → Development Mode** in the CF dashboard to
bypass the edge cache for 3 hours. Otherwise purge edge cache after each
asset change.

## `data/links.json` schema

```jsonc
{
  "profile":  { … },             // who you are
  "theme":    { … },             // colors + which template
  "sections": [ … ],             // groups of items
  "social":   [ … ],             // pill buttons under the hero
  "footer":   { … }              // bottom strip
}
```

### `profile`

| field     | type   | description                                       |
|-----------|--------|---------------------------------------------------|
| `name`    | string | Hero name. Last word is set in italic accent.     |
| `handle`  | string | Optional. Shown in the top marker (e.g. `@you`).  |
| `tagline` | string | Italic subtitle. Words separated by `·` get the accent color. |
| `bio`     | string | One-paragraph intro under the tagline.            |
| `location`| string | Currently unused after the live clock was removed; safe to leave or omit. |

### `theme`

| field      | type   | values                          | description |
|------------|--------|---------------------------------|-------------|
| `accent`   | string | hex color, e.g. `"#E8482C"`     | Single sharp accent color used throughout. |
| `template` | string | `"editorial"` (default), `"swiss"`, or `"cosmos"` | Visual treatment. See [Templates](#templates). |
| `mode`     | string | unused; kept for future use     | Theme toggle (auto/light/dark) is controlled by the corner pill, not this field. |

### `sections`

An ordered array of groups. Each section renders with a numbered masthead
(`№ 01 / Sites`) and a grid of items.

```json
{
  "id": "sites",                 // required, unique slug
  "label": "Sites",              // required, the section title
  "kicker": "Where I live online", // optional italic tagline
  "layout": "clients",           // optional — see Layouts below
  "headless": true,              // optional — render body only, no head
  "items": [ … ]                 // required, array of items
}
```

Set `headless: true` to render a section's body without the
`№ NN / Label / kicker` header. Tighter top margin too, so the
contents visually nest under the previous section. Useful for sliding
a testimonials carousel underneath a Clients wall, for example —
put the testimonials section directly after the clients section in
the `sections` array with `headless: true` and they'll read as one.

#### Layouts

| `layout`         | When to use                            | Grid behavior                          |
|------------------|----------------------------------------|----------------------------------------|
| *omitted*        | Default bento mix                      | 12-column asymmetric grid (link cards span 4/12, projects/youtube span 6/12, featured spans 8/12, portfolio spans 12/12) |
| `"clients"`      | Logo wall of clients/partners          | Auto-flowing square tiles, `minmax(108–124px, 1fr)` |
| `"testimonials"` | Quotes from clients / collaborators    | Crossfade carousel — one quote at a time, auto-advancing every 7s, with prev/next nav, dot indicators, swipe + ←/→ keys, pause on hover/focus. Reduced-motion users see all quotes stacked. |

`layout: "clients"` is also auto-detected if the first item in the section
has `type: "client"`. Same goes for `layout: "testimonials"` when the first
item is `type: "testimonial"`.

### Items

Every item lives in a section's `items` array and has a `type` field. The
six available types are `link`, `card`, `youtube`, `client`, `portfolio`,
and `testimonial` — documented below.

#### Optional `date` (any item type)

Every item type supports an optional `date` string. Use it to surface
"published", "shipped", "released", or "worked on" timestamps without
changing the item's `type`.

Accepted formats (all ISO-style, all interpreted as plain strings — no
time zones, no parsing surprises):

| Input          | Rendered as            | Use for                            |
|----------------|------------------------|------------------------------------|
| `"2026"`       | `2026`                 | Year-only — "this is from 2026"     |
| `"2026-05"`    | `May 2026`             | Year + month — soft / recurring     |
| `"2026-05-14"` | `May 14, 2026`         | Full date — talks, launches, posts  |

Where it appears per type:

- **`link`** — small monospaced caption under the host (separated by a `·`).
- **`card` (project)** — at the end of the tag row.
- **`portfolio`** — under the caption description.
- **`youtube`** — inline after the title overlay.
- **`client`** — rendered as a small caption under the client title.

The raw value is also written to the `<time datetime="…">` attribute so
the original ISO string is preserved for machines and screen readers,
even though humans see the friendly form.

```json
{ "type": "card", "title": "CoVote launched", "date": "2025-11-04" }
```

#### `type: "link"` — standard link card

```json
{
  "type": "link",
  "title": "Columinate",
  "url": "https://columinate.com",
  "description": "Cooperative Technology Solutions",
  "image": "https://example.com/logo.png",   // optional — overrides auto-favicon
  "featured": false                          // optional
}
```

| field         | required? | notes |
|---------------|-----------|-------|
| `title`       | yes       | Card headline. |
| `url`         | yes       | Where the card links to. Opens in new tab. |
| `description` | no        | Smaller line under the title. |
| `image`       | no        | Custom logo URL. Fills the favicon slot edge-to-edge (`object-fit: cover`). If omitted, a favicon is auto-fetched via Google's S2 service (`google.com/s2/favicons?sz=128`). |
| `icon`        | no        | Alias for `image`. |
| `featured`    | no        | Reserved; not currently styled differently for link cards. |

#### `type: "card"` — project card

Bigger, prose-friendly card with tags.

```json
{
  "type": "card",
  "title": "CoVote",
  "url": "https://covote.org",
  "description": "Anonymous election platform for co-ops.",
  "tags": ["democracy", "co-ops"],
  "featured": true                           // optional — makes it the hero card
}
```

| field         | required? | notes |
|---------------|-----------|-------|
| `title`       | yes       | Serif headline (Fraunces in editorial; Archivo 900 caps in Swiss). |
| `url`         | no        | If present, the card becomes a link. |
| `description` | no        | Paragraph under the title. |
| `tags`        | no        | Array of strings — small monospaced chips. |
| `featured`    | no        | When `true`, card spans 8/12 columns AND fills with the accent color (paper text on vermilion). Use sparingly — one per section. |

#### `type: "youtube"` — embedded video

Renders a lazy facade (thumbnail + play button). The real YouTube iframe
only loads when clicked, so the page stays fast even with many videos.

```json
{
  "type": "youtube",
  "id": "42EXoE7pNAc",
  "title": "The 7 Cooperative Principles Song"
}
```

| field   | required? | notes |
|---------|-----------|-------|
| `id`    | yes       | YouTube video ID (the `v=` parameter from the URL). |
| `title` | yes       | Shown over the thumbnail and as the iframe's accessible title. |

#### `type: "client"` — logo tile

Used in client/partner walls. Square logo tile with a small caption
below. Best in a section with `layout: "clients"`.

```json
{
  "type": "client",
  "title": "Columinate",
  "url": "https://columinate.coop",
  "image": "https://columinate.coop/i/logo-square.png"  // optional
}
```

| field   | required? | notes |
|---------|-----------|-------|
| `title` | yes       | Caption below the tile. Long names wrap inside the column width. |
| `url`   | no        | If present, the tile becomes a link. |
| `image` | no        | Custom logo. If omitted, an auto-favicon is used (rendered at 60% of the tile, contained). |
| `icon`  | no        | Alias for `image`. |

#### `type: "testimonial"` — quote + attribution

Best paired with `layout: "testimonials"` (see above) to render as a
crossfade carousel. A section with a single testimonial just renders
the card statically.

```json
{
  "type": "testimonial",
  "quote": "Working with Joel transformed how our co-op thinks about technology.",
  "name": "Jane Doe",
  "role": "Executive Director",
  "org": "Example Cooperative",
  "url": "https://example.coop",
  "image": "https://example.coop/avatars/jane.jpg",
  "date": "2025-09"
}
```

| field   | required? | notes |
|---------|-----------|-------|
| `quote` | yes       | The quote body. Renders inside a `<blockquote>` with a large opening curly-quote mark above. |
| `name`  | recommended | Person attributed. Bold below the quote. |
| `role`  | no        | Job title (e.g. "CEO"). Combined with `org` as `"Role, Org"`. |
| `org`   | no        | Company / organization. Combined with `role` if both present. |
| `url`   | no        | If present, the whole card becomes a link (opens in new tab). |
| `image` | no        | Avatar image URL. Square-cropped to a 44px circle. If omitted but `url` is present, an auto-favicon is fetched as a tiny round mark instead. |
| `icon`  | no        | Alias for `image`. |
| `date`  | no        | Optional date. Format per the [date field](#optional-date-any-item-type). |

#### `type: "portfolio"` — wide design/showcase

Always spans the full row. Use for featured design pieces, case-study
images, or any visual you want to feature large.

```json
{
  "type": "portfolio",
  "title": "Brand identity — Acme Co-op",
  "url": "https://example.com/case-study",
  "image": "https://example.com/portfolio/acme-hero.jpg",
  "description": "Logo system, packaging, signage",
  "ratio": "5:2"                             // optional, default "5:2"
}
```

| field         | required? | notes |
|---------------|-----------|-------|
| `image`       | yes       | The image to display. Fills the card with `object-fit: cover`. |
| `title`       | no        | Caption headline below the image. |
| `description` | no        | Caption subline. |
| `url`         | no        | If present, the card becomes a link. |
| `ratio`       | no        | Override aspect ratio. Format `"W:H"` (e.g. `"16:9"`, `"3:1"`, `"4:3"`). Default `"5:2"` (wide, not tall). |

### `social`

Pill buttons that appear under the hero bio.

```json
[
  { "label": "GitHub",   "url": "https://github.com/you",   "icon": "github" },
  { "label": "LinkedIn", "url": "https://linkedin.com/in/you", "icon": "linkedin" },
  { "label": "Email",    "url": "mailto:you@example.com",   "icon": "mail" },
  { "label": "RSS",      "url": "/feed.xml",                "icon": "rss" }
]
```

| field   | required? | notes |
|---------|-----------|-------|
| `label` | yes       | Text shown next to the icon. |
| `url`   | yes       | Link target. |
| `icon`  | no        | One of the built-in icon names (see below). Unknown values fall back to a generic chain-link icon. |

**Built-in icons:** `github`, `linkedin`, `mail`, `rss`, `link`.

The icons are not from a library — they're hand-coded inline SVGs in the
`SOCIAL_ICONS` object inside `assets/js/app.js`. Inline because:

- No extra HTTP requests
- Tint cleanly with `currentColor` so they inherit the link's text color
  (works in both editorial + Swiss templates, light + dark modes)
- Total weight for all 5 is ~2 KB

#### Where to find more icons

| Source | Best for | URL |
|---|---|---|
| **Simple Icons** | Brand logos — GitHub, Mastodon, Bluesky, YouTube, Instagram, X/Twitter, Substack, Discord, Patreon, Buy Me a Coffee, etc. (3000+ brands) | <https://simpleicons.org> |
| **Lucide** | Generic UI icons — mail, rss, link, phone, calendar, etc. (1500+, MIT-licensed) | <https://lucide.dev/icons> |
| **Phosphor** | 9000+ icons with multiple weights (regular / bold / thin / duotone) | <https://phosphoricons.com> |
| **Heroicons** | Tailwind's set, clean and minimal | <https://heroicons.com> |

For social/brand logos → **Simple Icons**. For generic UI marks (mail,
rss, link, etc.) → **Lucide** or **Phosphor**.

#### How to add a new icon

1. Find the icon on one of the sites above.
2. Click it and choose **"Copy SVG"** (or download the SVG).
3. Open `assets/js/app.js` and find the `SOCIAL_ICONS` object.
4. Paste the SVG as a new entry, keyed by a short name. Strip any
   hardcoded `fill="..."` or `stroke="..."` colors and replace them with
   `currentColor` so it inherits the link color.

   ```js
   const SOCIAL_ICONS = {
     github:   '<svg viewBox="0 0 24 24" fill="currentColor">…</svg>',
     linkedin: '<svg viewBox="0 0 24 24" fill="currentColor">…</svg>',
     mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">…</svg>',
     rss:      '<svg viewBox="0 0 24 24" fill="currentColor">…</svg>',
     link:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">…</svg>',

     // Newly added — Bluesky from Simple Icons:
     bluesky:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="…"/></svg>'
   };
   ```

5. Reference the new icon by its key in `data/links.json`:

   ```json
   { "label": "Bluesky", "url": "https://bsky.app/profile/you", "icon": "bluesky" }
   ```

6. Upload `app.js` and `links.json` (and purge Cloudflare cache or use
   Development Mode).

The fallback for any unknown `icon` value is a generic chain-link icon,
so it'll still render even if you forget step 4.

### `footer`

```json
{
  "copy": "Hand-built. No trackers.",
  "year": "auto"
}
```

| field  | required? | notes |
|--------|-----------|-------|
| `copy` | no        | Left side of the footer. |
| `year` | no        | Currently unused — the right side auto-displays the current year and your name. |

## Templates

`theme.template` selects the visual treatment. Both stylesheets are
always loaded, but the Swiss rules are scoped to
`:root[data-template="swiss"]` so only one is "active" at a time.

### `"editorial"` (default)

Magazine/poster aesthetic.

- **Type:** Fraunces (variable serif, italic for accents) + Geist (sans body) + Geist Mono (UI/eyebrows)
- **Mood:** warm paper background, vermilion accent, subtle grain texture, asymmetric bento grid, magazine-style section numbers, italic last-name in the hero, floating typographic asterism
- **Cards:** rounded corners (14px), thin rules, lift + corner-arrow on hover

### `"swiss"`

Müller-Brockmann tribute. Akzidenz/Univers spirit with [Archivo](https://fonts.google.com/specimen/Archivo) as the free variable substitute.

- **Type:** Archivo only, weights 400/500/600/700/900, all-caps headlines
- **Mood:** near-pure white paper, near-pure black ink, true Swiss red (`#DC2127` by default, overridable via `theme.accent`)
- **Geometry:** zero border-radius everywhere, 2–4px black rules, solid red disc replaces the typographic asterism
- **Cards:** invert on hover (white → solid black with paper text). Featured cards are solid red, invert to black on hover.
- **Animations:** no spin, no italic — only sharp pop-in for the geometric mark

### `"cosmos"`

Interstellar / sci-fi treatment. Lit by a real WebGL fragment shader
running in a fixed full-viewport canvas behind the page.

- **Type:** Orbitron (variable sans display) + Geist for body
- **Mood:** deep indigo paper, cyan + magenta + violet accents, dark-only
  (the light/auto theme toggle is overridden — cosmos is always night)
- **Background:** animated fractal-noise nebula with a procedural
  two-layer starfield, subtle "gravity well" perturbation toward the
  cursor, ~150 LOC GLSL fragment shader
- **Cards:** glassmorphic with `backdrop-filter`, conic-gradient
  holographic borders that rotate on hover (`@property --cosmos-hue`)
- **Hero:** glowing chromatic-split last name on hover, drifting
  light-orb in place of the asterism, gradient-clip wordmarks
- **Fallbacks:** when WebGL is unavailable or
  `prefers-reduced-motion: reduce` is set, a static CSS-only radial
  nebula renders instead — and all heavy animations are disabled

To switch:

```json
"theme": { "accent": "#E8482C", "template": "swiss" }
```

```json
"theme": { "template": "cosmos" }
```

Choice is also cached in `localStorage` (`dlstack-template`) so reloads
don't flash the wrong template before JSON parses.

## Theme (light / dark / auto)

A small pill in the top-right cycles **Auto → Light → Dark → Auto** on
click. "Auto" follows `prefers-color-scheme`. Choice persists in
`localStorage` (`dlstack-theme`). An inline boot script in `<head>`
applies the saved choice before CSS paint, so there's no flash on reload.

The accent color (`theme.accent` in JSON) is applied as a CSS custom
property at runtime and respects both light and dark modes.

## Reserved sub-paths

- `data/links.json` — content
- `assets/css/styles.css` — editorial template + base
- `assets/css/swiss.css` — swiss template overrides
- `assets/js/app.js` — renderer
- `favicon.svg` — the dL mark

Don't rename these without updating the references in `index.html`.

## Local preview

From the project root:

```bash
python3 -m http.server 8765
# then open http://127.0.0.1:8765
```

Any static file server works; CORS isn't an issue since everything is
same-origin.
