export const onRequest: PagesFunction = async ({ request, next, env }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return next();
  }
  let res = await next();
  if (res.status === 404 && request.method === 'GET') {
    return env.ASSETS.fetch(new Request(url.origin + '/index.html'));
  }
  return res;
};
