#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [
  ,
  ,
  slug,
  sourceHtmlPath,
  paperTitle,
  paperKicker,
  pdfName,
  texName,
  ...sourceFiles
] = process.argv;

if (!slug || !sourceHtmlPath || !paperTitle || !paperKicker || !pdfName || !texName) {
  console.error(
    "Usage: postprocess-make4ht.mjs <slug> <source-html> <title> <kicker> <pdf> <tex> [source-files...]",
  );
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "docs", slug);
const outPath = path.join(outDir, "paper.html");
const sourceBasename = path.basename(sourceHtmlPath, ".html");
const sourceDir = path.dirname(path.dirname(sourceHtmlPath));
const sourceTexPath = path.join(sourceDir, `${sourceBasename}.tex`);

const sourceHtml = fs.readFileSync(sourceHtmlPath, "utf8");
const bodyMatch = sourceHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!bodyMatch) {
  throw new Error(`Could not find a <body> in ${sourceHtmlPath}`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeArticleHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(?:src|href)=(["'])(?!https?:|mailto:|#|paper-assets\/)([^"']+\.(?:svg|png|jpg|jpeg|gif|webp))\1/gi, (match, quote, assetPath) => {
      const attr = match.trimStart().startsWith("src") ? "src" : "href";
      return ` ${attr}=${quote}paper-assets/${path.basename(assetPath)}${quote}`;
    })
    .trim();
}

function stripTrailingWhitespace(value) {
  return value.replace(/[ \t]+$/gm, "");
}

function extractMathJaxMacros(texPath) {
  if (!fs.existsSync(texPath)) return {};

  const tex = fs.readFileSync(texPath, "utf8");
  const macros = {};
  const commandPattern = /\\(?:newcommand|renewcommand)\s*\{\\([A-Za-z]+)\}\s*(?:\[[^\]]+\]\s*)?\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  let match;

  while ((match = commandPattern.exec(tex)) !== null) {
    const [, name, definition] = match;

    macros[name] = definition;
  }

  return macros;
}

const articleHtml = normalizeArticleHtml(bodyMatch[1]);
const bodyText = articleHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const mathJaxMacros = extractMathJaxMacros(sourceTexPath);

if (bodyText.length < 500) {
  throw new Error(`Generated article for ${slug} looks too small to be valid.`);
}

function sourceLabel(fileName) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".bib") return "BibTeX";
  if (extension === ".tex") return "TeX";
  return extension.slice(1).toUpperCase() || "source";
}

const sourceLinks = [
  `<a class="button secondary" href="${escapeHtml(texName)}">TeX</a>`,
  ...sourceFiles.map((fileName) => `<a class="button secondary" href="${escapeHtml(fileName)}">${escapeHtml(sourceLabel(fileName))}</a>`),
].join("\n              ");

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(paperTitle)} by Monysovann Ly.">
    <title>${escapeHtml(paperTitle)} | Paper Reader</title>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/styles.css">
    <script>
      window.MathJax = {
        tex: {
          tags: "ams",
          macros: ${JSON.stringify(mathJaxMacros, null, 12).replace(/\n/g, "\n          ")},
          inlineMath: [["\\\\(", "\\\\)"]],
          displayMath: [["\\\\[", "\\\\]"]],
          processEscapes: true
        },
        chtml: {
          matchFontHeight: false
        },
        options: {
          ignoreHtmlClass: "tex2jax_ignore"
        }
      };
    </script>
    <script defer id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js"></script>
  </head>
  <body class="article-body">
    <header class="site-header">
      <a class="brand" href="../">Monysovann Ly Papers</a>
      <nav class="nav" aria-label="Papers">
        <a href="../five-laws/">Five Laws</a>
        <a href="../sena/">SENA</a>
        <a href="../scores/">SCORES</a>
      </nav>
    </header>

    <main class="article-page">
      <section class="article-toolbar" aria-label="Paper links">
        <div>
          <a class="back-link" href="./">Details</a>
          <p class="eyebrow">${escapeHtml(paperKicker)}</p>
        </div>
        <div class="actions">
          <a class="button" href="${escapeHtml(pdfName)}">PDF</a>
          <a class="button secondary" href="${escapeHtml(pdfName)}" download>Download</a>
          ${sourceLinks}
        </div>
      </section>

      <article class="tex-article">
${articleHtml}
      </article>
    </main>

    <footer class="site-footer">
      <p>Paper content licensed under CC BY 4.0.</p>
    </footer>
  </body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, stripTrailingWhitespace(page));
