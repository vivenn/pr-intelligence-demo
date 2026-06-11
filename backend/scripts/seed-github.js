/**
 * One-off helper: seeds the configured GitHub repo with a few pull requests
 * (some merged, one open, with a review comment) so the sync + metrics pipeline
 * can be validated against real data. Safe to run against an empty repo.
 *
 * Usage: node scripts/seed-github.js
 */
require('dotenv').config();
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_ORG;
const REPO = (process.env.GITHUB_REPOS || '').split(',')[0].trim();

function api(method, path, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          Authorization: 'Bearer ' + TOKEN,
          'User-Agent': 'pr-intel-seed',
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`${method} ${path} -> ${res.statusCode}: ${parsed.message || body}`));
          } else {
            resolve(parsed);
          }
        });
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const b64 = (s) => Buffer.from(s).toString('base64');

async function ensureBaseCommit() {
  try {
    await api('GET', `/repos/${OWNER}/${REPO}/contents/README.md`);
    console.log('README.md already exists on default branch');
  } catch {
    await api('PUT', `/repos/${OWNER}/${REPO}/contents/README.md`, {
      message: 'Initial commit',
      content: b64('# PR Intelligence Demo\n\nSeed repository for validating the sync pipeline.\n'),
    });
    console.log('Created initial commit (README.md) on main');
  }
}

async function mainSha() {
  const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  return ref.object.sha;
}

async function createPr({ branch, file, content, title, body }) {
  const sha = await mainSha();
  await api('POST', `/repos/${OWNER}/${REPO}/git/refs`, { ref: `refs/heads/${branch}`, sha });
  await api('PUT', `/repos/${OWNER}/${REPO}/contents/${file}`, {
    message: `Add ${file}`,
    content: b64(content),
    branch,
  });
  const pr = await api('POST', `/repos/${OWNER}/${REPO}/pulls`, { title, body, head: branch, base: 'main' });
  console.log(`Opened PR #${pr.number}: ${title}`);
  return pr;
}

async function mergePr(number) {
  await api('PUT', `/repos/${OWNER}/${REPO}/pulls/${number}/merge`, { merge_method: 'squash' });
  console.log(`Merged PR #${number}`);
}

async function commentOnPr(number, bodyText) {
  await api('POST', `/repos/${OWNER}/${REPO}/issues/${number}/comments`, { body: bodyText });
  console.log(`Commented on PR #${number}`);
}

(async () => {
  if (!TOKEN || !OWNER || !REPO) {
    throw new Error('GITHUB_TOKEN, GITHUB_ORG, and GITHUB_REPOS must be set in .env');
  }
  console.log(`Seeding ${OWNER}/${REPO}...`);

  await ensureBaseCommit();

  const pr1 = await createPr({
    branch: 'feature/add-utils',
    file: 'src/utils.js',
    content: 'export const add = (a, b) => a + b;\nexport const sub = (a, b) => a - b;\n',
    title: 'Add math utils',
    body: 'Adds small math helper functions.',
  });
  await mergePr(pr1.number);

  const pr2 = await createPr({
    branch: 'feature/add-readme-usage',
    file: 'USAGE.md',
    content: '# Usage\n\nImport the helpers from src/utils.js.\n'.repeat(10),
    title: 'Document usage',
    body: 'Adds a usage guide.',
  });
  await commentOnPr(pr2.number, 'Looks good — could you add an example snippet?');
  await mergePr(pr2.number);

  const pr3 = await createPr({
    branch: 'feature/wip-config',
    file: 'config.json',
    content: JSON.stringify({ feature: true, threshold: 42 }, null, 2),
    title: 'WIP: add config (do not merge yet)',
    body: 'Work in progress — left open intentionally.',
  });
  console.log(`Left PR #${pr3.number} open`);

  console.log('Done seeding.');
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
