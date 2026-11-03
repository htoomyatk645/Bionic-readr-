# Build & load

```
npm install
npm run build          # one-shot build into ./build
npm run dev            # rebuild on save (esbuild watch + tailwind watch)
```

## Load the unpacked extension

1. Visit `chrome://extensions`.
2. Toggle on Developer mode.
3. Click **Load unpacked**.
4. Select the `build/` directory.

## Reload during development

After `npm run dev` rebuilds, click the reload icon on the Bionic Redr card in
`chrome://extensions`. Then refresh any page you were testing on.

## Package for the Chrome Web Store

```
npm run build
# zip the contents of build/ (not the folder itself)
```

Upload that zip in the Chrome Web Store developer dashboard.

## Notes

- The panel opens with the toolbar icon or **Ctrl/⌘+Shift+B**. On tabs that were
  open before the extension was installed/updated, clicking the icon injects the
  content scripts on demand.
- The panel UI is bundled (Inter variable font ships in `build/fonts/`); no
  third-party requests are made from host pages.
- Reading-position memory is stored in `chrome.storage.local`, never in the
  host page's IndexedDB. It can be cleared from the panel (Continuity → Clear history).
- Toolbar icons live in `icons/` (`icon.svg` is the source).
