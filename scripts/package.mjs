#!/usr/bin/env node
// Builds the extension and zips build/ into release/bionic-redr-<version>.zip,
// ready to upload to the Chrome Web Store.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf-8"));
const outDir = resolve(root, "release");
const zip = resolve(outDir, `bionic-redr-${version}.zip`);

execSync("node scripts/build.mjs", { stdio: "inherit", cwd: root });
mkdirSync(outDir, { recursive: true });
rmSync(zip, { force: true });
execSync(`zip -qr -X "${zip}" .`, { stdio: "inherit", cwd: resolve(root, "build") });
console.log(`[package] ${zip}`);
