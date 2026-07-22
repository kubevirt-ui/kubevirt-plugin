/**
 * Check whether the current time falls within Israel business hours (Sun-Thu 8-18).
 * Outputs `skip=true|false` to GITHUB_OUTPUT.
 *
 * Optional env: BUSINESS_HOURS_ONLY (default 'false')
 */

import { appendFileSync } from 'node:fs';

const main = async (): Promise<void> => {
  const businessHoursOnly = process.env.BUSINESS_HOURS_ONLY === 'true';

  if (!businessHoursOnly) {
    appendFileSync(process.env.GITHUB_OUTPUT!, 'skip=false\n');
    console.log('Business hours check disabled — proceeding with idle check.');
    return;
  }

  const now = new Date();
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const hour = israelTime.getHours();
  const dow = israelTime.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // Business hours: Sun(0)-Thu(4) 8:00-17:59
  const isBusinessDay = dow >= 0 && dow <= 4;
  const isBusinessHour = hour >= 8 && hour < 18;

  if (isBusinessDay && isBusinessHour) {
    appendFileSync(process.env.GITHUB_OUTPUT!, 'skip=true\n');
    console.log('Business hours (Sun-Thu 8-18 Israel) — skipping teardown.');
  } else {
    appendFileSync(process.env.GITHUB_OUTPUT!, 'skip=false\n');
    console.log('Outside business hours — proceeding with idle check.');
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
