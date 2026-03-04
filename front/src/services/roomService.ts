const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchUserIp(): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/ip`);
  if (!response.ok) {
    throw new Error("Failed to fetch IP");
  }
  const data = (await response.json()) as { ip: string };
  return data.ip;
}
