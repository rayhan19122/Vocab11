# Vocab11 — 11 Lectures. One Goal.

A vocabulary learning app for the 11 lectures in `11 Lectures .pdf`: 275 words, 3 synonyms each.
React + Vite + Tailwind CSS + Lucide. No backend: progress is saved in your browser (localStorage).

## Run it

```bash
pnpm install     # once
pnpm dev         # http://localhost:5173
```

## Build and check

```bash
pnpm build           # production build into dist/
pnpm preview         # serve the production build locally
pnpm lint            # oxlint
pnpm test            # unit tests (data, quiz engine, progress, storage)
pnpm data:validate   # checks src/data/vocabulary.js against the PDF transcription
```

## Where the data comes from

| File | What it is |
| --- | --- |
| `data-source/pdf-source.json` | Words and original example sentences, transcribed verbatim from the PDF |
| `data-source/content.txt` | Meaning, 3 synonyms, antonyms, difficulty for every word (`R` = no true synonym, closest related words) |
| `data-source/term-examples.txt` | An example sentence for every synonym and antonym (written for this app, not from the PDF) |
| `src/data/vocabulary.js` | **Generated** by `pnpm data:build` from the three files above. Do not edit by hand |

To change a meaning or synonym: edit `data-source/content.txt` (and the matching line in `term-examples.txt`), run `pnpm data:build`, then `pnpm data:validate`.

## Project layout

```text
src/
├── components/   common/ layout/ dashboard/ lecture/ flashcards/ practice/ progress/ settings/
├── context/      ProgressProvider (state + localStorage), ToastProvider
├── data/         vocabulary.js (generated)
├── hooks/        useProgress, useTheme, useKeys, useSwipe, useSpeech, useSound, ...
├── pages/        Dashboard, Lectures, LectureDetail, Flashcards, Practice, QuickStudy, WeakWords, Progress, Settings
└── utils/        storage, progress, spacedRepetition, quiz, fillBlank, sources, ...
```

## Deploy

Push to GitHub, then import the repository in Vercel (Framework: Vite, build `pnpm build`, output `dist`).
`vercel.json` already rewrites every path to `index.html` so deep links like `/lectures/4` work.
