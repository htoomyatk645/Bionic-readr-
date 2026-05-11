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
