#!/usr/bin/env node

const { existsSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = resolve(__dirname, "..");
const distDir = resolve(projectRoot, "dist");
const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || "4173";

let viteBin;

try {
  const vitePackageJson = require.resolve("vite/package.json", { paths: [projectRoot] });
  viteBin = resolve(dirname(vitePackageJson), "bin", "vite.js");
} catch {
  console.error("Vite não encontrado. Execute `npm install` antes de usar `npm start`.");
  process.exit(1);
}

if (!existsSync(distDir)) {
  console.error("Build não encontrado em `dist/`. Execute `npm run build` antes de usar `npm start`.");
  process.exit(1);
}

const child = spawn(process.execPath, [viteBin, "preview", "--host", host, "--port", String(port)], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    try {
      process.kill(process.pid, signal);
    } catch {
      process.exit(1);
    }
    return;
  }

  process.exit(code ?? 0);
});
