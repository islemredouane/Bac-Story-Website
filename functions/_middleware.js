export function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'bac-story-website.pages.dev') {
    url.hostname = 'www.bac-story.com';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
