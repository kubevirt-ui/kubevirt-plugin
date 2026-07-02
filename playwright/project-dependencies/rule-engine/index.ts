import type { SetupContext, SetupRule, TeardownContext, TeardownRule } from './types';

export async function runSetupRules(rules: SetupRule[], ctx: SetupContext): Promise<void> {
  for (const rule of rules) {
    if (rule.guard && !rule.guard(ctx)) continue;

    // eslint-disable-next-line no-console
    console.log(`  ▸ ${rule.name}`);
    try {
      await rule.run(ctx);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (rule.onError === 'throw') throw error;
      // eslint-disable-next-line no-console
      console.warn(`  ⚠️ ${rule.name}: ${msg}`);
    }
  }
}

export async function runTeardownRules(rules: TeardownRule[], ctx: TeardownContext): Promise<void> {
  for (const rule of rules) {
    if (rule.guard && !rule.guard(ctx)) continue;

    // eslint-disable-next-line no-console
    console.log(`  ▸ ${rule.name}`);
    try {
      await rule.run(ctx);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn(`  ⚠️ ${rule.name}: ${msg}`);
    }
  }
}
