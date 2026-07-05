# Papers

Static GitHub Pages site for Monysovann Ly's papers.

Site URL: <https://svanny.github.io/papers/>

## Papers

- A Formal Illumination of the Five Laws of Existence
- SENA: Sparse-stock Estimation with Nonstationary Adaptation
- Dynamic Latent Order Inference for Session Editing with Cold Item Uncertainty

## Repository Layout

- `docs/`: GitHub Pages site root.
- `docs/<paper>/`: public paper page, PDF, TeX, and bibliography files.
- `docs/<paper>/paper.html`: semantic HTML reader generated from TeX with TeX4ht and MathJax.
- `sources/<paper>/`: archival source package contents from the original ZIP files.
- `scripts/build-papers.sh`: compiles PDFs, generates semantic HTML readers, and copies public artifacts into `docs/`.

## Build

Install the TeX packages required by the papers:

```sh
tlmgr install collection-latexrecommended collection-latexextra collection-pictures make4ht tex4ht luaxml dvisvgm
```

Then build the PDFs, generated readers, and public paper artifacts:

```sh
scripts/build-papers.sh
```

## Local Preview

Serve the GitHub Pages root locally:

```sh
python3 -m http.server 8080 --directory docs
```

Then open <http://localhost:8080/>.

## Deployment

The repository is intended to be published as `Svanny/papers` with GitHub Pages
served from the `main` branch and `/docs` folder.

## License

Paper content is licensed under Creative Commons Attribution 4.0 International.
See `LICENSE`.
