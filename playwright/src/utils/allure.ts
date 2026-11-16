// Unified Allure utilities: annotations helper + environment writer
// Export: withAllure, AllureEnvironment, ClusterEnvironmentInfo

import { test as base } from '@playwright/test';

// ---- Annotations helper ----
/** Canonical Allure feature name for Tier 1 so Behaviors show a single "Tier 1" category */
export const ALLURE_TIER1_FEATURE = 'Tier 1';

/** Canonical Allure feature name for API contract tests — appears alongside "Gating" and "Tier 1" */
export const ALLURE_API_FEATURE = 'API';

const TIER1_TAG_VARIANTS = new Set(['@tier1', 'tier1']);

export interface AllureMeta {
  suite?: string;
  feature?: string;
  tags?: string[];
}

/**
 * Strips a leading "@" so tags can be compared against `allure-playwright`'s
 * own normalized form (see below).
 */
function normalizeTag(tag: string): string {
  return tag.startsWith('@') ? tag.slice(1) : tag;
}

export async function withAllure(meta: AllureMeta): Promise<void> {
  try {
    // Lazy require to avoid hard dependency at import time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allure } = require('allure-playwright');
    if (!allure) return;
    if (meta.suite) await allure.suite(meta.suite);
    // Map Tier1 / @tier1 / tier1 to canonical "Tier 1" so Behaviors show "Tier 1" instead of "@tier1"
    const feature =
      meta.feature === 'Tier1' || TIER1_TAG_VARIANTS.has(meta.feature || '')
        ? ALLURE_TIER1_FEATURE
        : meta.feature;
    if (feature) await allure.feature(feature);

    if (meta.tags && Array.isArray(meta.tags)) {
      // allure-playwright already auto-mirrors this test's native Playwright
      // `tag` metadata (test/describe `{ tag: [...] }`) into Allure tags,
      // stripping the leading "@" (e.g. "@gating" -> "gating"). Re-adding the
      // same tag here via allure.tag() produces a visible duplicate — both
      // "@gating" (this call, unstripped) and "gating" (the automatic one)
      // show up as separate chips on the same test. Skip any tag already
      // covered by that automatic mirroring instead of hardcoding a
      // per-constant allow-list (which is how the tier1-only fix above went
      // stale for every other reused tag constant).
      let nativeTags = new Set<string>();
      try {
        nativeTags = new Set(base.info().tags.map(normalizeTag));
      } catch {
        /* outside test context — fall back to tagging everything below */
      }

      for (const tag of meta.tags) {
        if (nativeTags.has(normalizeTag(tag))) continue;
        await allure.tag(tag);
      }
    }
  } catch {
    // No-op if Allure is not available; tests should still run
  }
}

/**
 * Logs a URL to Allure report as an attachment.
 * @param url - The URL to log
 * @param stepName - Optional step name (defaults to "Current URL")
 */
export function logUrlToAllure(url: string, stepName = 'Current URL'): void {
  try {
    // Lazy require to avoid hard dependency at import time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allure } = require('allure-playwright');
    if (!allure) return;
    allure.attachment(stepName, url, 'text/plain');
  } catch {
    // No-op if Allure is not available; tests should still run
  }
}

/**
 * Attaches a video file to the Allure report so it appears in the report when running locally or in CI.
 * Call when a test fails and you have a video path (e.g. from page.video().path()).
 */
export async function attachVideoToAllure(videoPath: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allure } = require('allure-playwright');
    if (!allure?.attachmentPath) return;
    await allure.attachmentPath('video', videoPath, {
      contentType: 'video/webm',
      fileExtension: 'webm',
    });
  } catch {
    // No-op if Allure is not available
  }
}

/**
 * Attaches a screenshot file to the Allure report.
 * Call when a test fails and you have a screenshot path.
 */
export async function attachScreenshotToAllure(screenshotPath: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allure } = require('allure-playwright');
    if (!allure?.attachmentPath) return;
    await allure.attachmentPath('screenshot', screenshotPath, {
      contentType: 'image/png',
      fileExtension: 'png',
    });
  } catch {
    // No-op if Allure is not available
  }
}

// ---- Environment helper ----
import * as fs from 'fs';
import * as path from 'path';

import { createApiClientFromToken } from '@/clients/rcc-singleton';

import { EnvVariables } from './env-variables';
import { logger } from './logger';
import { TestConfigManager } from './test-config';

interface HcoProductVersion {
  name?: string;
  version?: string;
}

interface CsvResource {
  metadata?: { name?: string };
  spec?: {
    install?: {
      spec?: {
        deployments?: Array<{
          spec?: {
            template?: {
              spec?: {
                containers?: Array<{ name?: string; image?: string }>;
              };
            };
          };
        }>;
      };
    };
  };
}

export interface ClusterEnvironmentInfo {
  Cluster: string;
  Console: string;
  'User mode'?: string;
  'Cluster Version'?: string;
  OS?: string;
  Kubevirt?: string;
  OpenShift?: string;
  'KubeVirt Console Plugin Version'?: string;
  'CNV Operator Version'?: string;
  'CNV Bundle Version'?: string;
}

export class AllureEnvironment {
  static async collectClusterInfo(
    _baseNamespace: string,
    _shardingInfo?: { totalShards: number; currentShard?: number },
  ): Promise<ClusterEnvironmentInfo> {
    const envInfo: ClusterEnvironmentInfo = {
      Cluster: EnvVariables.clusterUrl,
      Console: EnvVariables.webConsoleUrl,
      'User mode': EnvVariables.isNonPrivUser ? 'nonpriv' : 'priv',
    };

    try {
      const config = TestConfigManager.getConfig();
      if (!config.authToken) {
        logger.warn('No auth token available for cluster info collection');
        return envInfo;
      }

      const client = await createApiClientFromToken(config.authToken);

      try {
        const clusterVersion = await client.getClusterVersion();
        const desired = (clusterVersion?.status as Record<string, unknown>)?.desired as
          | { version?: string }
          | undefined;
        if (desired?.version) {
          const version = desired.version;
          envInfo['Cluster Version'] = version;
          envInfo.OpenShift = version;
        }
      } catch {
        logger.warn('Could not retrieve cluster version');
      }

      try {
        const nodeOs = await client.getNodeOsImage();
        if (nodeOs) {
          envInfo.OS = nodeOs.replace(/^System=\s*/i, '').trim();
        }
      } catch {
        logger.warn('Could not retrieve node operating system');
      }

      try {
        const pluginVersion = await client.getKubevirtPluginVersion();
        if (pluginVersion) {
          envInfo['KubeVirt Console Plugin Version'] = pluginVersion;
        }
      } catch {
        logger.warn('Could not retrieve KubeVirt console plugin version');
      }

      try {
        const hco = await client.getHyperConverged(
          EnvVariables.cnvNamespace,
          'kubevirt-hyperconverged',
        );
        if (hco?.status && (hco.status as Record<string, unknown>).versions) {
          const versions = (hco.status as Record<string, unknown>).versions as HcoProductVersion[];
          const kubevirtVersion = versions.find((v) => v.name === 'kubevirt');
          if (kubevirtVersion?.version) {
            envInfo.Kubevirt = kubevirtVersion.version;
          }
          const operatorVersion = versions.find((v) => v.name === 'operator');
          if (operatorVersion?.version) {
            envInfo['CNV Operator Version'] = operatorVersion.version;
          }
        }
      } catch {
        logger.warn('Could not retrieve CNV/KubeVirt versions');
      }

      try {
        const csvList = await client.listResourcesByKind('csv', EnvVariables.cnvNamespace);
        const hcoCsv = (csvList?.items || []).find((csv) =>
          csv.metadata?.name?.startsWith('kubevirt-hyperconverged-operator'),
        );
        if (hcoCsv) {
          const containers =
            (hcoCsv as CsvResource).spec?.install?.spec?.deployments?.[0]?.spec?.template?.spec
              ?.containers || [];
          const operatorContainer = containers.find(
            (c: { name?: string }) =>
              c.name === 'hyperconverged-cluster-operator' || c.name === 'operator',
          );
          const imageTag = (operatorContainer?.image || '').split(':').pop();
          if (imageTag) {
            envInfo['CNV Bundle Version'] = imageTag;
          }
        }
      } catch {
        logger.warn('Could not retrieve CNV bundle version from CSV');
      }
    } catch (error) {
      logger.warn(`Failed to collect some cluster information: ${error}`);
    }

    return envInfo;
  }

  static async setupAllureEnvironment(
    baseNamespace: string,
    allureResultsDir: string,
    shardingInfo?: { totalShards: number; currentShard: number },
  ): Promise<void> {
    const debugValue = process.env.DEBUG;
    const isDebugMode = debugValue === '1';
    if (isDebugMode) {
      logger.info(
        '🐛 Debug mode enabled (DEBUG=1) - skipping cluster data aggregation for Allure report',
      );
      return;
    }

    logger.info('📊 Collecting cluster information for Allure report...');

    const envInfo = await this.collectClusterInfo(baseNamespace, shardingInfo);
    const shouldWrite = !shardingInfo || shardingInfo.currentShard === 1;
    this.writeEnvironmentInfo(envInfo, allureResultsDir, shouldWrite);

    logger.success('✓ Cluster information collected for Allure report');
    logger.info('   Environment details:');
    Object.entries(envInfo)
      .filter(([_, value]) => value !== undefined)
      .forEach(([key, value]) => {
        logger.info(`   - ${key}: ${value}`);
      });
  }

  static writeEnvironmentInfo(
    envInfo: ClusterEnvironmentInfo,
    allureResultsDir: string,
    shouldWrite = true,
  ): void {
    if (!shouldWrite) {
      logger.info('⏭ ️ Skipping environment file write (handled by shard 1)');
      return;
    }

    try {
      if (!fs.existsSync(allureResultsDir)) {
        fs.mkdirSync(allureResultsDir, { recursive: true });
      }

      const propertiesPath = path.join(allureResultsDir, 'environment.properties');
      const propertiesContent = Object.entries(envInfo)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      fs.writeFileSync(propertiesPath, propertiesContent, 'utf-8');
      logger.info(`✓ Allure environment information written to ${propertiesPath}`);

      const jsonPath = path.join(allureResultsDir, 'environment.json');
      fs.writeFileSync(jsonPath, JSON.stringify(envInfo, null, 2), 'utf-8');
      logger.info(`✓ Allure environment information written to ${jsonPath}`);
    } catch (error) {
      logger.error(`Failed to write Allure environment information: ${error}`);
    }
  }
}
