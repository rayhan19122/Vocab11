# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev               # Vite dev server, http://localhost:5173
pnpm build             # production build into dist/
pnpm lint              # oxlint (config: .oxlintrc.json)
pnpm test              # vitest run (all tests in tests/)
pnpm vitest run tests/quiz.test.js        # one test file
pnpm vitest run -t "parseSource"          # tests whose name matches
pnpm data:build        # regenerate src/data/vocabulary.js from data-source/
pnpm data:validate     # check the generated dataset
```

Before committing a data or logic change, run `data:build`, `data:validate`, `test`, `lint` and `build`.

## Deployment

Vercel deploys automatically on push to `main` (https://vocab11.vercel.app). `vercel.json` rewrites every path to `index.html` so client-side routes like `/lectures/4` work. There is no Vercel CLI setup; deploying means pushing.

## Architecture

React 19 + Vite + Tailwind 4 + react-router 7 + lucide-react. No backend: all learner state lives in localStorage.

### Vocabulary data pipeline

`src/data/vocabulary.js` is **generated** — never edit it by hand. `scripts/build-vocabulary.mjs` builds it from three sources:

- `data-source/pdf-source.json` — words and example sentences transcribed **verbatim** from the lecture PDFs (`11 Lectures .pdf` → Lectures 1–11, `Lec 13-23.pdf` → Lectures 13–17, 19–23). Do not reword these.
- `data-source/content.txt` — one row per word: `word | meaning | syn;syn;syn | ant;ant | e/m/h | R` (`R` = synonyms are only the closest related words). Grouped under `# ---- Lecture NN ----` headers.
- `data-source/term-examples.txt` — `Word | term: sentence | term: sentence ...`, one sentence per synonym then per antonym, in the same order as `content.txt`.

A word that appears in several lectures shares a single row in both text files. A `Word@<lecture>` row (e.g. `Secure@14`, `Exploit@23`) overrides it for one lecture when the sense differs; the build looks up `word@lecture` first, then `word`.

`scripts/validate-data.mjs` enforces: the expected lecture list (`EXPECTED_LECTURES`, currently 1–11, 13–17, 19–23), 25 words per lecture, no duplicate word within a lecture (repeats across lectures are allowed), id format `lNN-wNN`, and that every term's example sentence contains the term (first 5 chars of its longest word, or first 3 if that word is ≤5 letters). `tests/data.test.js` hard-codes totals (lecture count, word count, term-example count) — update them when adding data.

**Lecture numbers have gaps** (no 12 or 18). Never assume lectures are `1..N`: use the generated `lectureIds`, `lectures` and `isLectureId` exports from `vocabulary.js`. Copy that mentions a lecture count derives it from `lectures.length`.

### State and progress

- `src/utils/storage.js` is the only module that touches localStorage (key `vocab11:state:v1`). Loading sanitizes everything and drops word ids / lecture ids that no longer exist, so reads never throw.
- `src/utils/spacedRepetition.js` — the per-word model (`new → learning → review → mastered`), intervals, weak/learned/due predicates.
- `src/utils/progress.js` — pure state transitions and selectors (recording answers, streaks, daily stats). No React, no storage.
- `src/context/ProgressProvider.jsx` holds the state in React and persists via `storage.js`; components use the `useProgress` hook.

Progress is keyed by word id (`lNN-wNN`), so the same word in two lectures has independent progress.

### Study features

- `src/utils/quiz.js` builds practice questions. Distractors must exclude other entries of the same word (`sameWord`/`otherWords`) and never repeat an option (`uniqueBy`) — repeated words across lectures make this matter.
- `src/utils/fillBlank.js` blanks the word out of its PDF sentence, with fallbacks for inflected forms (including dropping a final `e`/`y`, e.g. Violate → violating).
- `src/utils/sources.js` turns a study choice from the URL/query (`all`, `weak`, `due`, `random`, or a lecture id) into a word list; Flashcards, Practice and Quick Study use it.
- Routes are defined in `src/App.jsx`; pages are in `src/pages/`, feature components in `src/components/<feature>/`.
