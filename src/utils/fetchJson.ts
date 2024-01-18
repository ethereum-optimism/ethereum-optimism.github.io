export const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error('status', response.status)
    console.error('error', await response.text().catch(() => 'unknown erroor'))
    throw new Error(`Failed to fetch token list from ${url}`);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error('error', e)
    throw new Error(`Failed to parse token list from ${url}`);
  }
}
