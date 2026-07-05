# Papers

Static GitHub Pages site for Monysovann Ly's papers.

Site URL: <https://svanny.github.io/papers/>

## Papers

- A Formal Illumination of the Five Laws of Existence
- SENA: Sparse-stock Estimation with Nonstationary Adaptation
- SCORES: Shelf Trajectories with Slow and Fast Components via Spectral Quadratic Surrogates

## Repository Layout

- `docs/`: GitHub Pages site root.
- `docs/<paper>/`: public paper page, PDF, TeX, and bibliography files.
- `sources/<paper>/`: archival source package contents from the original ZIP files.
- `scripts/build-papers.sh`: compiles PDFs from `sources/` and copies public artifacts into `docs/`.

## Build

Install the TeX packages required by the papers:

```sh
tlmgr install collection-latexrecommended collection-latexextra collection-pictures
```

Then build the PDFs and public paper artifacts:

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
