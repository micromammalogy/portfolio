# Setup & maintenance

This repo's `README.md` is generated. The weekly workflow (`.github/workflows/update-portfolio.yml`)
re-renders it from a curated config that is stored **as an encrypted secret**, not as a file here.
That's deliberate: the config maps each project to its source repositories, and those repo names
must never appear in this public repo.

## One-time setup (about 5 minutes)

### 1. Create a read-only Personal Access Token
- GitHub → **Settings → Developer settings → Fine-grained tokens → Generate new token**
- **Resource owner:** your personal account (`micromammalogy`)
- **Repository access:** *Only select repositories* → pick your **personal** project repos only
  (the ones marked `liveStats: true` in the config). No org repos are needed.
- **Permissions:** Repository → *Contents: Read-only* and *Metadata: Read-only*. Nothing else.
- **Expiration:** 90 days (set a calendar reminder to regenerate).
- Copy the token.

### 2. Add the two repository secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**
- `GH_READ_TOKEN` → paste the token from step 1.
- `PORTFOLIO_CONFIG` → paste the entire contents of your local `portfolio.config.SECRET.json`.

> **Keep `portfolio.config.SECRET.json` in a directory _outside_ this cloned repo** (e.g. a sibling
> `../portfolio-secret/` folder) — never inside the `portfolio/` working tree. `.gitignore` is only a
> backstop; keeping the file out of the tree entirely is the real protection.

### 3. Trigger the first run
Repo → **Actions → Update portfolio → Run workflow**. It regenerates `README.md` and commits it.

## Ongoing

- **Weekly:** the workflow runs every Monday and refreshes the "last updated" stamp plus live
  activity dates for personal projects. No action needed.
- **Adding a new project:** this is always a deliberate step. Run the discovery helper locally to
  see what's new, then add a genericized entry to your `portfolio.config.SECRET.json` and update the
  `PORTFOLIO_CONFIG` secret:
  ```
  node scripts/discover.mjs --config /path/to/portfolio.config.SECRET.json
  ```
- **Editing wording:** edit `portfolio.config.SECRET.json`, update the `PORTFOLIO_CONFIG` secret,
  and run the workflow.

## Security properties
- No repository names appear anywhere in this public repo. The generator **enforces** this: if any
  configured repo name reaches the rendered README, it aborts and writes nothing (no commit, no push).
- The token is read-only, scoped to personal repos only, and expires.
- The workflow has `contents: write` and nothing else, and pins each action to a specific commit SHA.
- `GH_READ_TOKEN` is masked in Actions logs (GitHub redacts the exact secret value). Note:
  `PORTFOLIO_CONFIG` is a structured JSON secret — GitHub does **not** mask individual fields pulled
  out of it, so the generator never prints config internals. Do not add debug `console.log` of config
  fields, even temporarily.
