import { scenarioTest as test, expect } from '@/fixtures/scenario-fixture';

test.describe('Scenario smoke', () => {
  test('Virtualization perspective loads', async ({ overviewPage }) => {
    await overviewPage.switchToVirtualization();
    await expect(overviewPage.heading).toBeVisible({ timeout: 30_000 });
  });
});
