export async function onRequestPost() {
  return new Response("OK_FROM_FUNCTION", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
