import { logger } from '@/utils/logger';

import type { SetupContext, SetupRule, TeardownContext, TeardownRule } from './types';
import { SetupPhase, TeardownScope } from './types';

export { getSetupRules } from './setup-rules';
export { getTeardownRules } from './teardown-rules';
export type { SetupContext, SetupRule, TeardownContext, TeardownRule } from './types';
export { SetupPhase, TeardownScope } from './types';

const SETUP_PHASE_ORDER: SetupPhase[] = [
  SetupPhase.AUTH,
  SetupPhase.CLUSTER,
  SetupPhase.BROWSER,
  SetupPhase.REPORTING,
];

const TEARDOWN_SCOPE_ORDER: TeardownScope[] = [
  TeardownScope.NAMESPACE,
  TeardownScope.CLUSTER,
  TeardownScope.FILES,
];

function formatSetupRuleLabel(rule: SetupRule): string {
  return `[${rule.id}] ${rule.name} (${rule.phase})`;
}

function formatTeardownRuleLabel(rule: TeardownRule): string {
  return `[${rule.id}] ${rule.name} (${rule.scope})`;
}

function setupErrorDetail(rule: SetupRule, err: unknown): string {
  const base = `Setup rule failed: ${formatSetupRuleLabel(rule)}`;
  if (err instanceof Error && err.message) {
    return `${base}: ${err.message}`;
  }
  return `${base}: ${String(err)}`;
}

function teardownErrorDetail(rule: TeardownRule, err: unknown): string {
  const base = `Teardown rule failed: ${formatTeardownRuleLabel(rule)}`;
  if (err instanceof Error && err.message) {
    return `${base}: ${err.message}`;
  }
  return `${base}: ${String(err)}`;
}

export class RuleEngine {
  async runSetup(rules: SetupRule[], ctx: SetupContext): Promise<void> {
    for (const phase of SETUP_PHASE_ORDER) {
      const phaseRules = rules.filter((r) => r.phase === phase);
      for (const rule of phaseRules) {
        if (rule.guard && !rule.guard(ctx)) {
          logger.info(`⏭️ Skipped setup rule (guard): ${formatSetupRuleLabel(rule)}`);
          continue;
        }
        try {
          await rule.run(ctx);
          logger.success(`Setup rule OK: ${formatSetupRuleLabel(rule)}`);
        } catch (err) {
          const detail = setupErrorDetail(rule, err);
          if (rule.onError === 'throw') {
            logger.error(`❌ ${detail}`);
            throw err;
          }
          if (rule.onError === 'warn') {
            logger.warn(detail);
            continue;
          }
          logger.info(`⏭️ ${detail} (onError=skip)`);
        }
      }
    }
  }

  async runTeardown(rules: TeardownRule[], ctx: TeardownContext): Promise<void> {
    for (const scope of TEARDOWN_SCOPE_ORDER) {
      const scopeRules = rules.filter((r) => r.scope === scope);
      for (const rule of scopeRules) {
        if (rule.guard && !rule.guard(ctx)) {
          logger.info(`⏭️ Skipped teardown rule (guard): ${formatTeardownRuleLabel(rule)}`);
          continue;
        }
        try {
          await rule.run(ctx);
          logger.success(`Teardown rule OK: ${formatTeardownRuleLabel(rule)}`);
        } catch (err) {
          const detail = teardownErrorDetail(rule, err);
          if (rule.onError === 'warn') {
            logger.warn(detail);
          } else {
            logger.info(`⏭️ ${detail} (onError=skip)`);
          }
        }
      }
    }
  }
}
