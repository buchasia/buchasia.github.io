# Repository guidance

## Run data privacy and maintenance

- `content/data/runs.json` is public data. Never add locations, exact start times, activity titles, or health/performance metrics to it.
- Keep only the privacy-safe run fields currently defined in `src/utils/runs.ts`.
- When a new Garmin `Activities.csv` export is available, regenerate `content/data/runs.json` with `node scripts/import-garmin-activities.mjs <csv-path> content/data/runs.json`.
- Before pushing to `origin`, check whether the Garmin export changed and update `runs.json` when needed.

## Localization

- Any new or changed public page must have both English and German routes. For runs pages, keep `/runs/` and `/runs/[year]/` in sync with `/de/runs/` and `/de/runs/[year]/`.

To enable the repository's pre-push reminder locally, run:

```sh
git config core.hooksPath .githooks
```
