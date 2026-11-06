# Dial Down — website

Marketing site for **Dial Down – Breathe and Relax** ([App Store](https://apps.apple.com/us/app/dial-down-breathe-and-relax/id6818409674)).
Plain HTML/CSS/JS with no build step. Every link is relative, so it works at a domain root or under a GitHub Pages project path.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: animated hero (tension meter and turning dial), pinned "How it works" scroll story, Ask Dial Down demo, Body Map, breathing demo, routines, privacy, download |
| `support.html` | Support and FAQ |
| `privacy.html` | Privacy Policy (text copied from the app's `Legal/PrivacyPolicy.html`) |
| `terms.html` | Terms of Use (text copied from the app's `Legal/TermsOfUse.html`) |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |

## Layout

```
css/styles.css        all styles (design tokens at the top, shared nav and footer, home sections, sub-pages)
js/main.js            home-page behaviour (hero intro, meter, scroll effects, story, breathing demo, Ask demo)
assets/screens/       app screenshots (JPEG, 1280 px tall)
assets/brand/         logo symbol SVGs
assets/og-image.png   1200×630 link-preview image
favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest
```

## Keeping it in sync with the app

- **Screenshots** come from `Breath - Relax & Stretch/App Screenshots/*.png`. Convert them with:
  `sips -s format jpeg -s formatOptions 82 -Z 1280 in.png --out assets/screens/name.jpg`
- **Breathing timings** in `js/main.js` mirror `BreathingModels.swift`.
- **Ask demo** replays the exchange shown in screenshots 11–14.
- **Routine counts and summaries** mirror `Models/PremadeRoutine.swift`.
- **Legal pages:** when the app's `Legal/*.html` changes, regenerate `privacy.html` and `terms.html` so the wording stays identical.

## Preview locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Animations respect **Reduce Motion**: everything is still readable with motion off.
