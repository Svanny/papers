#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEX_BIN_DIR="${TEX_BIN_DIR:-/Users/svanny/Library/TinyTeX/bin/universal-darwin}"

if [[ -d "$TEX_BIN_DIR" ]]; then
  export PATH="$TEX_BIN_DIR:$PATH"
fi

require_tool() {
  local tool="$1"

  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    echo "Install TeX4ht support with: tlmgr install make4ht tex4ht luaxml dvisvgm" >&2
    exit 1
  fi
}

require_tool "latexmk"
require_tool "make4ht"

compile_paper() {
  local slug="$1"
  local tex_file="$2"
  local pdf_name="$3"
  local public_tex_name="$4"
  local paper_title="$5"
  local paper_kicker="$6"
  shift 6

  local source_dir="$ROOT_DIR/sources/$slug"
  local public_dir="$ROOT_DIR/docs/$slug"
  local pdf_file="${tex_file%.tex}.pdf"
  local html_build_dir="$source_dir/.html-build"
  local html_file="$html_build_dir/${tex_file%.tex}.html"
  local html_assets_dir="$public_dir/paper-assets"

  mkdir -p "$public_dir" "$html_build_dir" "$html_assets_dir"
  find "$html_build_dir" -mindepth 1 -delete
  find "$html_assets_dir" -mindepth 1 -delete

  (
    cd "$source_dir"
    latexmk -C "$tex_file"
    latexmk -pdf -g -halt-on-error -interaction=nonstopmode "$tex_file"
    make4ht -f html5 -d "$html_build_dir" -B "$html_build_dir" "$tex_file" "mathjax"
  )

  cp "$source_dir/$pdf_file" "$public_dir/$pdf_name"
  cp "$source_dir/$tex_file" "$public_dir/$public_tex_name"

  if command -v pdftoppm >/dev/null 2>&1; then
    pdftoppm -png -singlefile -f 1 -l 1 -r 120 "$public_dir/$pdf_name" "$public_dir/${slug}-cover"
  fi

  for bib_file in "$@"; do
    if [[ -f "$source_dir/$bib_file" ]]; then
      cp "$source_dir/$bib_file" "$public_dir/$bib_file"
    fi
  done

  find "$html_build_dir" -maxdepth 1 -type f \( \
    -name '*.svg' -o \
    -name '*.png' -o \
    -name '*.jpg' -o \
    -name '*.jpeg' -o \
    -name '*.gif' -o \
    -name '*.webp' \
  \) -exec cp {} "$html_assets_dir/" \;

  node "$ROOT_DIR/scripts/postprocess-make4ht.mjs" \
    "$slug" \
    "$html_file" \
    "$paper_title" \
    "$paper_kicker" \
    "$pdf_name" \
    "$public_tex_name" \
    "$@"
}

compile_paper \
  "five-laws" \
  "main.tex" \
  "five-laws.pdf" \
  "five-laws.tex" \
  "A Formal Illumination of the Five Laws of Existence" \
  "Philosophy / metaphysics"

compile_paper \
  "sena" \
  "main.tex" \
  "sena.pdf" \
  "sena.tex" \
  "SENA: Sparse-stock Estimation with Nonstationary Adaptation" \
  "Bayesian inventory modeling" \
  "refs.bib"

compile_paper \
  "scores" \
  "main_parameters.tex" \
  "scores.pdf" \
  "scores.tex" \
  "SCORES: Shelf Trajectories with Slow and Fast Components via Spectral Quadratic Surrogates" \
  "Ordering / spectral methods" \
  "references.bib"

echo "Built paper PDFs, semantic HTML readers, and public source files under docs/."
