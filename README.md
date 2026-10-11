# Inference From Scratch

An interactive course that takes you from "I have never run a model" to "I can reason about,
build and optimise an LLM inference engine". The running example is **Qwen3-0.6B**, and every
number on the site comes from that real checkpoint.

Three things make it different from a blog with code blocks:

1. **The model actually runs in your browser.** No install, no signup, no API key — the
   tokenizer and the weights are loaded client-side, with WebGPU when available and a WASM
   fallback when it is not.
2. **Every displayed number is computed.** Parameter counts, byte counts, KV cache sizes and
   FLOP counts are generated from the real `config.json` and safetensors by the scripts in
   `/tools`, then re-validated by `npm run artifacts:validate`.
3. **Every claim is labelled.** Figures are stamped `live`, `precomputed`, `measured-here` or
   `illustrative`, so you always know whether you are looking at your machine's measurement or
   someone else's.

---

## Quick start

```bash
npm install
npm run artifacts     # optional: only needed to regenerate the precomputed data
npm run dev           # http://localhost:3000
```

The precomputed artifacts in `public/artifacts/qwen3-0.6b/` are committed, so you can skip
`npm run artifacts` entirely and the site works immediately. You only need it if you change a
generator in `/tools`.

### Requirements

- Node 20+ and npm
- Python 3.10+ with `torch`, `transformers`, `numpy` (only for regenerating artifacts)
- No GPU. The whole core path is designed for a laptop CPU.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static production build (output in `out/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest: content contract, the device-lab registry, the simulators, the widget URL codec, the profile model |
| `npm run verify` | typecheck + test + build |
| `npm run artifacts` | Regenerate every artifact from the real checkpoint |
| `npm run artifacts:validate` | Re-check all artifacts against the checkpoint |

---

## Profile (optional, local)

Setting up a profile adds a name, an avatar and an accent to the site, and gives you a profile
page with your own numbers on it: modules complete, quiz average, cards due, bookmarks. It costs
nothing and it is stored in this browser alongside the rest of your progress — no account, no
server, no sign-in, and nothing sent anywhere.

To carry progress to another machine, export it from settings and import it there; the profile
travels in the same file. See D-015 in [`docs/DECISIONS.md`](docs/DECISIONS.md) for why accounts
are deliberately not part of this.

---

## Deploying

The site is a static export (`output: "export"` in `next.config.mjs`), so there is no server
component and no environment variable to configure for the core path.

```bash
npm run build      # writes ./out
```

- **Vercel / Netlify**: point them at the repo. Framework preset "Next.js" works; the export
  directory is `out`.
- **GitHub Pages**: wired up in [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).
  On every push to `main` it installs, runs `npm run verify` and uploads `out/` as a Pages
  artifact, so the build output never has to be committed. Set **Settings → Pages → Source** to
  **GitHub Actions** once. Because the course uses trailing-slash URLs (`trailingSlash: true`),
  no extra rewrite rules are needed.

  A Pages *project* site is served from a subpath, `https://<owner>.github.io/<repo>/`, so the
  workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo>` before building. Without it the export's asset
  URLs point at the domain root, which returns the HTML with a 404 for every stylesheet and
  script — an unstyled, inert page. The variable is unset locally, so `npm run dev` and a plain
  `npm run build` are unchanged, and a root deployment (a custom domain, or a repository named
  `<owner>.github.io`) needs no base path; the workflow detects that case and leaves it empty.
  Runtime paths that Next's `basePath` cannot rewrite — the artifact fetches and the Pyodide
  worker — go through `withBasePath()` in [`lib/base-path.ts`](lib/base-path.ts).

The only network dependency at runtime is the model download from the public ONNX build of
Qwen3-0.6B, which the browser caches after the first visit. Everything else is served from
`out/`.

### Keeping the repository pushable

`node_modules/`, `.next/`, `out/`, `out-v0/`, `.model-cache/` and the build logs are all in
`.gitignore`: several hundred megabytes of downloaded dependencies, weights and generated output
that every command above recreates. If a push is rejected by GitHub for a file over 100 MB, the
file is already in the history, where `.gitignore` cannot reach it — run

```bash
bash tools/git-unblock-push.sh          # report what a push would send
bash tools/git-unblock-push.sh --apply  # remove it from history, working tree untouched
```

and see [`docs/GITHUB.md`](docs/GITHUB.md) for what that does and why it rewrites a clone rather
than the repository itself.

### What the site does not do in the browser

Real CUDA and Triton kernels cannot run in a browser tab, and neither can a serving process.
Four claims in the course are therefore measurements of *your* hardware, and they are taught as
procedures rather than by faking a number: measure your decode ceiling against your own memory
bandwidth, watch the attention score matrix hit peak-memory counters, run a real OpenAI-
compatible server and read its scheduler metrics, and produce a benchmark report you have to
defend. Each one lives at the end of the module that argues for it and is also listed at
[`/own-hardware`](app/(site)/own-hardware/page.tsx): numbered steps, the exact commands, the
primary sources, a checkpoint per step, a report card, and a questionnaire answered from your
own run (two thirds correct marks it complete).

Where a visual is precomputed from the real checkpoint rather than computed live, it is labelled
`precomputed`; where a lab runs on your machine instead, it says `you run this, on your
hardware`. Nothing on the site pretends to have measured a GPU it did not use.

---

## Repository layout

```
app/                Next.js App Router routes (lesson route, course map, glossary, …)
content/            MDX lessons, plus quizzes, experiments, break-it challenges, glossary
components/         UI, visuals, lab framework (the code labs themselves)
lib/model/          in-browser runtime: tokenizer, Qwen3 generation, device detection
lib/sim/            deterministic discrete-event simulators (paging allocator, scheduler)
lib/base-path.ts    the one place that knows the subpath the site is deployed under
labs/registry.ts    browser labs: starter code, hidden tests, hint ladder, solution
labs/device.ts      labs you run yourself: steps, commands, sources, report card, questionnaire
tools/              Python generators for the precomputed artifacts
public/artifacts/   the artifacts themselves (real model output, committed)
public/labs/        the Pyodide worker, served at /labs/ (a worker is loaded by URL, not bundled)
notebooks/          the benchmark notebook the 6.1 device lab walks through
tests/              content contract and unit tests
docs/               DECISIONS.md, ARCHITECTURE.md, CONTENT_GUIDE.md, CONTRIBUTING.md
.github/workflows/  GitHub Pages deploy: build, upload out/, publish
```

---

## Adding a module

1. **Register it** in `lib/course.ts`: `id`, `slug` (`part-N/lesson-name`), title, tldr,
   difficulty, prerequisites, read/lab minutes, and a `lab` id or `null`.
2. **Write the lesson** at `content/<slug>.mdx`. It is plain MDX with a global component set —
   no imports needed. It must open with `<ModuleHeader id="N.M" />` and end with quiz,
   experiments and a "Going deeper" section.
3. **Write the quiz** in `content/quizzes.ts` (5+ questions, mixing `concept`, `numeric` and
   `predict`) and the **experiments** in `content/experiments.ts` (3+ cards, each with a
   `predict` prompt — predict-then-reveal is mandatory).
4. **Optionally add a lab** in `labs/registry.ts`: starter code, hidden test cases, hints and a
   solution. Reference it with `<Lab id="..." />`. If the lab needs a real GPU — a measurement,
   a kernel, a server — add it to `labs/device.ts` instead and reference it with
   `<DeviceLab id="..." />`, setting the module's `deviceLab` field so the progress ring and the
   `/own-hardware` hub pick it up.
5. **Run `npm test`.** The content contract test fails if any of the above is missing, if a
   lesson contains placeholder text, or if a prerequisite points at a module that does not
   exist.

Full conventions, including the writing rules and the component catalogue, are in
[`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).

---

## Regenerating the artifacts

```bash
python -m pip install torch transformers numpy
python tools/build_artifacts.py        # writes public/artifacts/qwen3-0.6B/
python tools/validate_artifacts.py     # re-checks every claim in the payload
```

The generators download `Qwen/Qwen3-0.6B` on first run (about 1.2 GB) into `.model-cache/`.
They export attention maps, per-layer activations, the logit lens, quantisation error data,
RoPE retrieval probes, reference logits for the from-scratch lab, and recorded greedy
continuations. `validate_artifacts.py` re-derives each quantity from the checkpoint and fails
loudly on any mismatch — including on prose that claims a wrong number.

---

## License and attribution

Course content is original. Qwen3-0.6B belongs to the Qwen team and is used under its own
license; the ONNX conversion used by the browser runtime is the community `onnx-community`
build. Papers referenced throughout are cited in the appendices with links to their sources.
