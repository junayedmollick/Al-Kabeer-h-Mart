export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error('Cannot reach the store server. Please try again.');
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The store is temporarily unavailable. Please try again shortly.');
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('The store API returned an invalid response. Please try again.'); }
  if (!response.ok) throw Object.assign(new Error(data?.error || 'Request failed'), { status: response.status });
  return data;
}
