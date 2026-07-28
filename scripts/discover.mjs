#!/usr/bin/env node
/*
 * LOCAL-ONLY helper — do NOT run this in the public workflow (its output lists repo names).
 *
 * Lists your merged PR activity grouped by repo and flags repos that are NOT yet
 * represented in your portfolio config, so you can decide (with a genericized title)
 * what new work to add. Run where `gh` is authenticated:
 *
 *   node scripts/discover.mjs --config ../portfolio-secret/portfolio.config.SECRET.json
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Hard guard: this helper prints repo names and must never run in CI (GitHub sets GITHUB_ACTIONS=true).
if (process.env.GITHUB_ACTIONS === 'true') {
  console.error('discover.mjs is local-only and must not run in CI.');
  process.exit(1);
}

const args = process.argv.slice(2);
const ci = args.indexOf('--config');
const configPath = ci >= 0 ? args[ci + 1] : null;

const known = new Set();
if (configPath) {
  const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
  for (const s of cfg.sections || [])
    for (const g of s.groups || [])
      for (const it of g.items || [])
        for (const r of it.sources || []) known.add(r.toLowerCase());
}

const raw = execSync('gh search prs --author=@me --limit 300 --json repository,createdAt', { encoding: 'utf8' });
const byRepo = new Map();
for (const pr of JSON.parse(raw)) {
  const r = pr.repository.nameWithOwner;
  const e = byRepo.get(r) || { count: 0, last: '' };
  e.count++;
  if (pr.createdAt > e.last) e.last = pr.createdAt;
  byRepo.set(r, e);
}

const rows = [...byRepo.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));
console.log('\nRepos with your PR activity (newest first):\n');
for (const [repo, e] of rows) {
  const flag = known.has(repo.toLowerCase()) ? '   ' : ' + ';
  console.log(`${flag}${repo.padEnd(46)}${String(e.count).padStart(3)} PRs   last ${e.last.slice(0, 10)}`);
}
console.log('\n" + " = not yet in your portfolio config. Decide whether to add it (with a genericized title).\n');
