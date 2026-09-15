const fs = require("fs");
const path = require("path");
const { build } = require("esbuild");
const bytenode = require("bytenode");

async function empaquetarBackend() {
  const distDir = path.join(__dirname, "dist");
  const archivoTemporal = path.join(distDir, "server.cjs");
  const archivoCompilado = path.join(distDir, "server.jsc");
  const archivoLoader = path.join(distDir, "loader.cjs");

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  console.log("Compilando backend con esbuild...");

  await build({
    entryPoints: ["src/server.js"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    packages: "external",
    outfile: archivoTemporal,
  });

  console.log("Generando bytecode con bytenode...");

  await bytenode.compileFile({
    filename: archivoTemporal,
    output: archivoCompilado,
    compileAsModule: true,
  });

  fs.writeFileSync(
    archivoLoader,
    `
require("bytenode");
require("./server.jsc");
`.trimStart()
  );

  fs.unlinkSync(archivoTemporal);

  console.log("Backend empaquetado correctamente en dist/server.jsc");
}

empaquetarBackend().catch((error) => {
  console.error("Error empaquetando backend:", error);
  process.exit(1);
});