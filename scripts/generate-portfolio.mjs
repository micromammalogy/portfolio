#!/usr/bin/env node
/*
 * Renders README.md for the portfolio from a config blob.
 *
 * Config source (in priority order):
 *   1. PORTFOLIO_CONFIG env var  -> lives ONLY in an encrypted GitHub Actions secret
 *   2. --config <path>           -> for local runs
 *
 * Security invariant: this script NEVER writes repository names into the output.
 * Only the display fields from config (title / stack / dateLabel / blurb) are rendered.
 * `sources` (real repo names) are used solely for optional live-stat lookups and are
 * never printed to stdout/stderr.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const noLive = args.includes('--no-live');
const outPath = arg('--out', 'README.md');
const configPath = arg('--config', null);
const token = process.env.GH_READ_TOKEN || '';

function loadConfig() {
  const raw = process.env.PORTFOLIO_CONFIG;
  if (raw && raw.trim()) {
    // No interpolation of the parser error: never echo a fragment of the secret to CI logs.
    try { return JSON.parse(raw); }
    catch { throw new Error('PORTFOLIO_CONFIG is not valid JSON.'); }
  }
  if (configPath) {
    try { return JSON.parse(readFileSync(configPath, 'utf8')); }
    catch (e) { throw new Error(`Config file is not valid JSON: ${e.message}`); }
  }
  throw new Error('No config: set PORTFOLIO_CONFIG env or pass --config <path>');
}

async function repoStats(login, repo) {
  // { count, lastISO } for merged PRs authored by `login` in `repo`.
  const q = `type:pr author:${login} repo:${repo} is:merged`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=1`;
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-generator' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return { count: data.total_count || 0, lastISO: data.items?.[0]?.created_at || null };
}

const monthYear = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
};

async function liveSuffix(item, login) {
  if (noLive || !item.liveStats || !login || !Array.isArray(item.sources)) return null;
  let last = null;
  for (const repo of item.sources) {
    try {
      const { lastISO } = await repoStats(login, repo);
      if (lastISO && (!last || lastISO > last)) last = lastISO;
    } catch { /* skip a repo we can't read; never surface the name */ }
  }
  const my = monthYear(last);
  return my ? `last active ${my}` : null;
}

function renderItem(item, suffix) {
  const stack = (item.stack || []).join(' · ');
  const meta = [stack ? '`' + stack + '`' : null, item.dateLabel || null, suffix || null]
    .filter(Boolean).join(' · ');
  return `**${item.title}**${meta ? ' · ' + meta : ''}\n${item.blurb || ''}`.trim();
}

const config = loadConfig();
const login = config.githubLogin || '';
const out = [];

out.push(`# ${config.docTitle || 'Project Portfolio'}${config.owner ? ' — ' + config.owner : ''}`, '');
if (config.headline) out.push(config.headline, '');
if (config.intro) out.push('*' + config.intro + '*', '');

for (const section of config.sections || []) {
  out.push('---', '', `## ${section.title}`, '');
  for (const group of section.groups || []) {
    if (group.label) out.push(`**${group.label}**`, '');
    for (const item of group.items || []) {
      out.push(renderItem(item, await liveSuffix(item, login)), '');
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
out.push('---', '', `<sub>Auto-updated weekly from GitHub activity · last updated: ${today}</sub>`, '');

// ENFORCED INVARIANT (hard control, not a convention): no repository identifier from the
// config may reach the public output. If any source repo name — full `owner/repo`, or a
// distinctive bare repo name — appears in the rendered text, abort and write NOTHING, so the
// unattended workflow can never commit or push a leak. The thrown message never contains the token.
const rendered = out.join('\n');
const lower = rendered.toLowerCase();
const safeText = `${config.headline || ''}\n${config.intro || ''}`.toLowerCase();
const banned = new Set();
for (const section of config.sections || [])
  for (const group of section.groups || [])
    for (const item of group.items || [])
      for (const repo of item.sources || []) {
        banned.add(repo.toLowerCase()); // full slug, e.g. "owner/repo"
        const bare = (repo.split('/')[1] || '').toLowerCase(); // bare name, e.g. "repo"
        // Skip bare names that legitimately appear in the author-written headline/intro
        // (e.g. a public domain like zonos.com) — those are trusted, non-sensitive fields.
        if (bare && !safeText.includes(bare)) banned.add(bare);
      }
for (const token of banned) {
  if (token && lower.includes(token)) {
    throw new Error('Aborting: a repository identifier leaked into the rendered output. Nothing was written or committed.');
  }
}

writeFileSync(outPath, rendered);
console.error(`Wrote ${outPath}.`); // no repo names in logs
