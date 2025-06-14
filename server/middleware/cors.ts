export default defineEventHandler((event) => {
  const origin = event.node.req.headers.origin;

  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': origin || '',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true'
  });

  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return '';
  }
});
