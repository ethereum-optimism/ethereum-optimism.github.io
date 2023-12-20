export const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error('status', response.status)
    console.error('error', await response.text().catch(() => 'unknown erroor'))
    throw new Error(`Failed to fetch token list from ${url}`);
  }
  return await response.json();
}
