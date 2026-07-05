#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

compile_paper() {
  local slug="$1"
  local tex_file="$2"
  local pdf_name="$3"
  local public_tex_name="$4"
  shift 4

  local source_dir="$ROOT_DIR/sources/$slug"
  local public_dir="$ROOT_DIR/docs/$slug"
  local pdf_file="${tex_file%.tex}.pdf"

  mkdir -p "$public_dir"

  (
    cd "$source_dir"
    latexmk -C "$tex_file"
    latexmk -pdf -g -halt-on-error -interaction=nonstopmode "$tex_file"
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
}

compile_paper "five-laws" "main.tex" "five-laws.pdf" "five-laws.tex"
compile_paper "sena" "main.tex" "sena.pdf" "sena.tex" "refs.bib"
compile_paper "scores" "main_parameters.tex" "scores.pdf" "scores.tex" "references.bib"

echo "Built paper PDFs and public source files under docs/."
