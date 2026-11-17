# Publishing to the Chrome Web Store

## 1. Create the upload package

```bash
npm install
npm run package
```

This builds the extension and creates `release/bionic-redr-<version>.zip`. The zip holds the *contents* of `build/` with `manifest.json` at the top level, which is what the store expects.

## 2. Register as a Chrome Web Store developer (one time)

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and sign in with the Google account that will own the listing.
2. Accept the developer agreement and pay the one-time US$5 registration fee.
3. Verify your contact email under **Account**.

## 3. Upload the extension

1. In the dashboard, click **New item**.
2. Upload `release/bionic-redr-<version>.zip`.

## 4. Fill in the listing

**Store listing tab**

- **Description:** paste the text under [Store description](#store-description) below.
- **Category:** Accessibility (or Productivity).
- **Icon:** `icons/icon-128.png`.
- **Screenshots:** up to five, 1280×800. See [Store media](#store-media).
- **Small promo tile (440×280)** and optional **marquee promo tile (1400×560):** see [Store media](#store-media).

**Privacy tab**

- **Single purpose:** "Makes web page text easier to read by bolding the start of each word and adjusting typography."
- **Permission justifications:**
  - *Host permission (all sites):* "Restyles text on whatever page the user is reading."
  - *storage:* "Saves the user's settings and reading positions locally."
  - *scripting:* "Starts the reader on tabs that were already open when the extension was installed."
- **Remote code:** No.
- **Data usage:** tick **Website content** and **Web history** (reading positions are stored locally), then certify that data is not sold, not used for unrelated purposes and not used for creditworthiness.
- **Privacy policy URL:** `https://github.com/htoomyatk645/Bionic-readr-/blob/main/PRIVACY.md`

**Distribution tab:** choose Public or Unlisted and the regions.

## 5. Submit for review

Click **Submit for review**. Review usually takes a few days. Extensions that request access to all sites can take longer.

## Releasing an update

1. Increase `version` in `manifest.json`, `package.json` and `package-lock.json`. The store rejects a version number it has already seen.
2. Run `npm run package`.
3. In the dashboard, open the item, go to **Package → Upload new package**, then submit for review again.
4. If the panel or features changed, replace the screenshots and promo tiles on the **Store listing** tab and update the description.

## Store media

Chrome Web Store image sizes:

| Asset | Size | Required |
| --- | --- | --- |
| Screenshots | 1280×800 (or 640×400), up to 5 | At least 1 |
| Small promo tile | 440×280 | Yes |
| Marquee promo tile | 1400×560 | No (used if Google features the extension) |

Export them as PNG or 24-bit JPEG with no transparency, and keep the files in `docs/store/` so the next release can reuse them.

## Store description

**Summary:** the store takes this from `description` in `manifest.json` (132 characters max), currently:

> Read faster with less effort: bold word anchors, key points, text size and spacing controls. Private, on-device.

**Description:**

```
Bionic Redr makes any web page easier to read.

Your eyes don't read every letter. They jump between anchor points, and your brain fills in the rest. Bionic Redr bolds the start of each word so every jump lands sooner and lines flow with less effort.

WHAT YOU GET
• Word anchors: five steps from Off to Max, plus fine control over anchor length.
• Reading modes: Focus, Flow, Study and Deep Read, each remembering your changes.
• Key points: fade everything but the most important sentences, or show just the outline.
• Highlights: a soft underline on the sentences that carry the most meaning.
• Text size and spacing: text size from 85% to 150%, plus line, letter and paragraph spacing.
• Smart reading: learns your pace and eases dense passages.
• Reading memory: remembers where you stopped and offers to resume.
• Pause on any site with one tap. Light and dark themes.

PRIVATE BY DESIGN
Everything stays on your device. No accounts, no servers, no analytics, no tracking.

Open the panel from the toolbar icon or press Ctrl+Shift+B (Cmd+Shift+B on Mac).
```

**What's new in 0.3.0** (for the description or your release notes):

```
• Redesigned panel: simpler, with the essentials up front and everything else in More Settings.
• New text size control (85%–150%).
• Key points and highlights are now one tap away on the main screen.
```
