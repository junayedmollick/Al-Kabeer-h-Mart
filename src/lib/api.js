export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch {
    throw new Error('Cannot reach the store server. Please try again.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || (response.status === 404 ? 'API service route not found (404)' : `Server request failed (${response.status})`);
    throw Object.assign(new Error(message), { status: response.status });
  }
  if (!data) throw new Error('The server returned an invalid response');
  return data;
}
