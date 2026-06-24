import type KubernetesClient from '@/clients/kubernetes-client';
import type { ClusterJanitor } from '@/utils/cluster-janitor';
import { logger } from '@/utils/logger';

/** Ordered phases for global setup execution. */
export enum SetupPhase {
  AUTH = 'AUTH',
  BROWSER = 'BROWSER',
  CLUSTER = 'CLUSTER',
}

/** Ordered scopes for global teardown execution. */
export enum TeardownScope {
  CLUSTER = 'CLUSTER',
  FILES = 'FILES',
  NAMESPACE = 'NAMESPACE',
}

const SETUP_PHASE_ORDER: SetupPhase[] = [SetupPhase.AUTH, SetupPhase.CLUSTER, SetupPhase.BROWSER];

const TEARDOWN_SCOPE_ORDER: TeardownScope[] = [
  TeardownScope.NAMESPACE,
  TeardownScope.CLUSTER,
  TeardownScope.FILES,
];

/** Mutable context passed through setup rules. */
export interface SetupContext {
  authToken?: string;
  /** Native cluster janitor instance (set when ENABLE_CLUSTER_JANITOR=1). */
  clusterJanitor?: ClusterJanitor;
  cnvNamespace: string;
  effectiveKubeConfigPath?: string;
  k8sClient?: KubernetesClient;
  kubeConfigPath: string;
  /** Actual IDP username discovered from the login page UI (non-priv mode only). */
  nonPrivUsername?: string;
  projectRoot: string;
  storageStatePath: string;
  testNamespace: string;
}

/** Context passed through teardown rules. */
export interface TeardownContext {
  k8sClient?: KubernetesClient;
  kubeConfigPath?: string;
  shouldCleanupClusterResources: boolean;
  testNamespace: string;
}

/** How to handle a failed setup rule. */
export type SetupOnError = 'skip' | 'throw' | 'warn';

/** How to handle a failed teardown rule (never throws). */
export type TeardownOnError = 'skip' | 'warn';

/** Named setup rule with phase, guard, and error strategy. */
export interface SetupRule {
  guard?: (ctx: SetupContext) => boolean;
  id: string;
  name: string;
  onError: SetupOnError;
  phase: SetupPhase;
  run: (ctx: SetupContext) => Promise<void>;
}

/** Named teardown rule with scope, guard, and error strategy (never throws). */
export interface TeardownRule {
  guard?: (ctx: TeardownContext) => boolean;
  id: string;
  name: string;
  onError: TeardownOnError;
  run: (ctx: TeardownContext) => Promise<void>;
  scope: TeardownScope;
}

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

/** Executes setup/teardown rule lists with phase/scope grouping, guards, and logging. */
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
