/** Poll without Playwright `expect` (assertions belong in spec files). */
export async function pollUntil(
  condition: () => Promise<boolean>,
  options: { message: string; timeout: number; intervalMs?: number },
): Promise<void> {
  const intervalMs = options.intervalMs ?? 500;
  const deadline = Date.now() + options.timeout;
  while (Date.now() < deadline) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(options.message);
}

export async function waitForUrlMatch(
  url: () => string,
  pattern: RegExp,
  options: { message: string; timeout: number },
): Promise<void> {
  await pollUntil(() => Promise.resolve(pattern.test(url())), options);
}
