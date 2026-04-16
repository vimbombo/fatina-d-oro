"use strict";

// Phaser runs in the browser; this only checks the package is installed after `npm install`.
const path = require("path");
const fs = require("fs");

const pkgPath = path.join(__dirname, "node_modules", "phaser", "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("Run `npm install` in this folder to install Phaser (node_modules).");
  process.exit(1);
}

const phaserPkg = require(pkgPath);
console.log("FlappyTest — Phaser dependency:", phaserPkg.version);
