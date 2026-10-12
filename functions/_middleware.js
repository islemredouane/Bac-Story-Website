// Runs before every request to the site (Cloudflare Pages Functions middleware).

// 1) Old pages.dev address -> canonical www.bac-story.com
const PAGES_DEV_HOST = 'bac-story-website.pages.dev';

// 2) Internal files that live in the GitHub repo but must never be served on the
//    website. They stay in the repo; visitors just get the normal 404 page.
//    Paths are compared in lower case, with any trailing slash removed.
const BLOCKED_FILES = new Set([
  '/readme.md',
  '/package.json',
  '/package-lock.json',
  '/.gitignore',
  '/api/form.js',
  '/code.gs',
  '/feedback-apps-script.gs',
  '/bac-2027-curriculum-changes-old-backup',
  '/bac-2027-curriculum-changes-old-backup.html',
  '/backup-old-popup-modal.js',
]);

// Whole folders that are tooling/backends, not website content.
const BLOCKED_FOLDERS = [
  '/apps-script',   // Google Apps Script backends (forms)
  '/scripts',       // build tools (sitemap generator)
  '/functions',     // Pages Functions source code
  '/.git',
  '/.claude',
  '/.vscode',
  '/node_modules',
];

// 3) Old addresses that were removed for good. They answer "410 Gone" so search
//    engines drop them faster than with a plain 404. Each entry also needs a line
//    in _routes.json, otherwise this code never sees the request.
//    Folders (the folder itself and everything inside it):
const GONE_FOLDERS = [
  // old stream names of the excellence topics (now ge, le, math, lp)
  '/topics/excellence-topics/gestion',
  '/topics/excellence-topics/langues',
  '/topics/excellence-topics/matheleme',
  '/topics/excellence-topics/litphilo',
  // computer science pages, removed from the site
  '/computer-science',
  '/resources/math/computer-science',
  '/resources/tech/computer-science',
];
//    Single pages:
const GONE_FILES = new Set([
  '/university/speciality/ens-francais',
  '/university/speciality/ens-sport',
  '/university/speciality/ens-tamazight',
  '/resources/ge/math/salasil-al-mizan/sequences',
  '/preview',
]);

function isGone(pathname) {
  const p = normalizePath(pathname).replace(/\.html$/, '');
  if (GONE_FILES.has(p)) return true;
  return GONE_FOLDERS.some((dir) => p === dir || p.startsWith(dir + '/'));
}

// Any file with these extensions (source notes, Apps Script, Python tools).
const BLOCKED_EXTENSIONS = /\.(md|gs|py)$/;

function normalizePath(pathname) {
  let p = pathname;
  try { p = decodeURIComponent(p); } catch (e) { /* keep raw path if malformed */ }
  p = p.replace(/\/{2,}/g, '/').toLowerCase();
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

function isBlocked(pathname) {
  const p = normalizePath(pathname);
  if (BLOCKED_FILES.has(p)) return true;
  if (BLOCKED_EXTENSIONS.test(p)) return true;
  if (p.split('/').some((seg) => seg.startsWith('.env'))) return true;
  return BLOCKED_FOLDERS.some((dir) => p === dir || p.startsWith(dir + '/'));
}

async function notFound(context, status = 404) {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
    'X-Robots-Tag': 'noindex',
  };
  // Serve the site's own 404 page with a real 404 status.
  try {
    if (context.env && context.env.ASSETS) {
      const page = await context.env.ASSETS.fetch(new URL('/404', context.request.url));
      const type = page.headers.get('content-type') || '';
      if (type.includes('text/html')) return new Response(page.body, { status, headers });
    }
  } catch (e) { /* fall through to the plain response */ }
  return new Response(status === 410 ? 'Gone' : 'Not Found', { status, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === PAGES_DEV_HOST) {
    url.hostname = 'www.bac-story.com';
    return Response.redirect(url.toString(), 301);
  }

  if (isBlocked(url.pathname)) {
    return notFound(context);
  }

  if (isGone(url.pathname)) {
    return notFound(context, 410);
  }

  return context.next();
}
