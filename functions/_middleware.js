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
  '/.vercelignore',
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

async function notFound(context) {
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
      if (type.includes('text/html')) return new Response(page.body, { status: 404, headers });
    }
  } catch (e) { /* fall through to the plain response */ }
  return new Response('Not Found', { status: 404, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
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

  return context.next();
}
