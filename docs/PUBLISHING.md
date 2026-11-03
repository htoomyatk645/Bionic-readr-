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

- **Description:** use the features list from the README.
- **Category:** Accessibility (or Productivity).
- **Icon:** `icons/icon-128.png`.
- **Screenshots:** at least one, 1280×800 or 640×400. `docs/screenshot-light.png` and `docs/screenshot-dark.png` are 1280×860, so crop them to 1280×800 first.
- **Small promo tile (440×280):** optional but recommended.

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

1. Increase `version` in both `manifest.json` and `package.json`. The store rejects a version number it has already seen.
2. Run `npm run package`.
3. In the dashboard, open the item, go to **Package → Upload new package**, then submit for review again.
