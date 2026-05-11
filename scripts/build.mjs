#!/usr/bin/env node
import { build } from "esbuild";
import { execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");
const outDir = resolve(root, "build");
const isWatch = process.argv.includes("--watch");

const entries = [
  { in: "src/background.ts", out: "background.js", format: "esm" },
  { in: "src/contents/bionic.ts", out: "contents/bionic.js", format: "iife" },
  { in: "src/contents/sidebar.tsx", out: "contents/sidebar.js", format: "iife" },
  { in: "src/contents/warmup.tsx", out: "contents/warmup.js", format: "iife" }
];

function clean() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(resolve(outDir, "contents"), { recursive: true });
}

function compileTailwind() {
  const cssIn = resolve(root, "src/contents/style.css");
  const cssOut = resolve(outDir, ".tailwind.css");
  execSync(
    `npx tailwindcss -i "${cssIn}" -o "${cssOut}" ${isWatch ? "" : "--minify"}`,
    { stdio: "inherit", cwd: root }
  );
  return readFileSync(cssOut, "utf-8");
}

function copyManifest() {
  copyFileSync(resolve(root, "manifest.json"), resolve(outDir, "manifest.json"));
}

async function bundleAll(cssText) {
  const common = {
    bundle: true,
    platform: "browser",
    target: ["chrome110"],
    jsx: "automatic",
    loader: { ".tsx": "tsx", ".ts": "ts" },
    define: {
      "process.env.NODE_ENV": JSON.stringify(isWatch ? "development" : "production"),
      __SIDEBAR_CSS__: JSON.stringify(cssText)
    },
    tsconfig: resolve(root, "tsconfig.json"),
    absWorkingDir: root,
    minify: !isWatch,
    sourcemap: isWatch ? "inline" : false,
    logLevel: "warning"
  };

  await Promise.all(
    entries.map((e) =>
      build({
        ...common,
        format: e.format,
        entryPoints: [resolve(root, e.in)],
        outfile: resolve(outDir, e.out)
      })
    )
  );
}

async function buildOnce() {
  const start = Date.now();
  clean();
  const css = compileTailwind();
  await bundleAll(css);
  copyManifest();
  try {
    rmSync(resolve(outDir, ".tailwind.css"));
  } catch {}
  console.log(`[build] done in ${Date.now() - start}ms → ${outDir}`);
}

async function watchMode() {
  const chokidar = await import("chokidar");
  await buildOnce();
  console.log("[build] watching src/ + manifest.json + tailwind.config.js");
  let building = false;
  let pending = false;
  const rebuild = async () => {
    if (building) {
      pending = true;
      return;
    }
    building = true;
    try {
      await buildOnce();
    } catch (err) {
      console.error("[build] error", err);
    } finally {
      building = false;
      if (pending) {
        pending = false;
        rebuild();
      }
    }
  };
  chokidar.default
    .watch(["src", "manifest.json", "tailwind.config.js", "postcss.config.js"], {
      ignoreInitial: true,
      cwd: root
    })
    .on("all", () => {
      rebuild();
    });
}

if (isWatch) {
  watchMode().catch((err) => {
    console.error("[build] fatal", err);
    process.exit(1);
  });
} else {
  buildOnce().catch((err) => {
    console.error("[build] fatal", err);
    process.exit(1);
  });
}
