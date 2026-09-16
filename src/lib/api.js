export async function api(path, options = {}) {
  let response;
  try { response = await fetch('/api' + path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...options.headers }, body: options.body === undefined ? undefined : JSON.stringify(options.body) }); }
  catch { throw new Error('Cannot reach the store server. Please try again.'); }
  const data = await response.json().catch(() => ({ error: 'The server returned an invalid response' }));
  if (!response.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: response.status });
  return data;
}
