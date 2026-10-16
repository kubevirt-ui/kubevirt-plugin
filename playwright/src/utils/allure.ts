// Unified Allure utilities: annotations helper + environment writer (kubevirt-ui main)

import * as fs from 'fs';
import * as path from 'path';

import { resolveKubeconfig, runOcCommand } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { test as base } from '@playwright/test';

export const ALLURE_TIER1_FEATURE = 'Tier 1';
export const ALLURE_API_FEATURE = 'API';

const TIER1_TAG_VARIANTS = new Set(['@tier1', 'tier1']);

export interface AllureMeta {
  suite?: string;
  feature?: string;
  tags?: string[];
}

function normalizeTag(tag: string): string {
  return tag.startsWith('@') ? tag.slice(1) : tag;
}

export async function withAllure(meta: AllureMeta): Promise<void> {
  try {
    const { allure } = require('allure-playwright') as {
      allure?: {
        suite: (v: string) => Promise<void>;
        feature: (v: string) => Promise<void>;
        tag: (v: string) => Promise<void>;
      };
    };
    if (!allure) return;
    if (meta.suite) await allure.suite(meta.suite);
    const feature =
      meta.feature === 'Tier1' || TIER1_TAG_VARIANTS.has(meta.feature || '')
        ? ALLURE_TIER1_FEATURE
        : meta.feature;
    if (feature) await allure.feature(feature);

    if (meta.tags && Array.isArray(meta.tags)) {
      let nativeTags = new Set<string>();
      try {
        nativeTags = new Set(base.info().tags.map(normalizeTag));
      } catch {
        /* outside test context */
      }
      for (const tag of meta.tags) {
        if (nativeTags.has(normalizeTag(tag))) continue;
        await allure.tag(tag);
      }
    }
  } catch {
    // No-op if Allure is not available
  }
}

export function logUrlToAllure(url: string, stepName = 'Current URL'): void {
  try {
    const { allure } = require('allure-playwright') as {
      allure?: { attachment: (name: string, body: string, type: string) => void };
    };
    if (!allure) return;
    allure.attachment(stepName, url, 'text/plain');
  } catch {
    // ignore
  }
}

export async function attachVideoToAllure(videoPath: string): Promise<void> {
  try {
    const { allure } = require('allure-playwright') as {
      allure?: {
        attachmentPath: (
          name: string,
          path: string,
          opts: { contentType: string; fileExtension: string },
        ) => Promise<void>;
      };
    };
    if (!allure?.attachmentPath) return;
    await allure.attachmentPath('video', videoPath, {
      contentType: 'video/webm',
      fileExtension: 'webm',
    });
  } catch {
    // ignore
  }
}

export async function attachScreenshotToAllure(screenshotPath: string): Promise<void> {
  try {
    const { allure } = require('allure-playwright') as {
      allure?: {
        attachmentPath: (
          name: string,
          path: string,
          opts: { contentType: string; fileExtension: string },
        ) => Promise<void>;
      };
    };
    if (!allure?.attachmentPath) return;
    await allure.attachmentPath('screenshot', screenshotPath, {
      contentType: 'image/png',
      fileExtension: 'png',
    });
  } catch {
    // ignore
  }
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

function ocJson(kubeconfig: string | undefined, args: string): string | undefined {
  if (!kubeconfig) {
    return undefined;
  }
  try {
    return runOcCommand(`oc ${args}`, kubeconfig);
  } catch {
    return undefined;
  }
}

export class AllureEnvironment {
  static collectClusterInfo(kubeconfig?: string): ClusterEnvironmentInfo {
    const kube = kubeconfig ?? resolveKubeconfig();
    const envInfo: ClusterEnvironmentInfo = {
      Cluster: EnvVariables.clusterUrl,
      Console: EnvVariables.webConsoleUrl,
      'User mode': EnvVariables.isNonPrivUser ? 'nonpriv' : 'priv',
    };

    const clusterVersion = ocJson(
      kube,
      'get clusterversion version -o jsonpath="{.status.desired.version}"',
    );
    if (clusterVersion) {
      envInfo['Cluster Version'] = clusterVersion;
      envInfo.OpenShift = clusterVersion;
    }

    const osImage = ocJson(kube, 'get nodes -o jsonpath="{.items[0].status.nodeInfo.osImage}"');
    if (osImage) {
      envInfo.OS = osImage.replace(/^System=\s*/i, '').trim();
    }

    const pluginVersion = ocJson(
      kube,
      'get consoleplugin kubevirt-plugin -o jsonpath="{.metadata.labels.app\\.kubernetes\\.io/version}"',
    );
    if (pluginVersion) {
      envInfo['KubeVirt Console Plugin Version'] = pluginVersion.replace(/^"|"$/g, '').trim();
    }

    const cnvNs = EnvVariables.cnvNamespace;
    try {
      const hcoRaw = ocJson(kube, `get hyperconverged kubevirt-hyperconverged -n ${cnvNs} -o json`);
      if (hcoRaw) {
        const hco = JSON.parse(hcoRaw) as {
          status?: { versions?: Array<{ name?: string; version?: string }> };
        };
        const versions = hco.status?.versions ?? [];
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
      const csvListRaw = ocJson(kube, `get csv -n ${cnvNs} -o json`);
      if (csvListRaw) {
        const csvList = JSON.parse(csvListRaw) as {
          items?: Array<{
            metadata?: { name?: string };
            spec?: {
              install?: {
                spec?: {
                  deployments?: Array<{
                    spec?: { template?: { spec?: { containers?: Array<{ image?: string }> } } };
                  }>;
                };
              };
            };
          }>;
        };
        const hcoCsv = (csvList.items ?? []).find((csv) =>
          csv.metadata?.name?.startsWith('kubevirt-hyperconverged-operator'),
        );
        const image =
          hcoCsv?.spec?.install?.spec?.deployments?.[0]?.spec?.template?.spec?.containers?.[0]
            ?.image ?? '';
        const imageTag = image.split(':').pop();
        if (imageTag) {
          envInfo['CNV Bundle Version'] = imageTag;
        }
      }
    } catch {
      logger.warn('Could not retrieve CNV bundle version from CSV');
    }

    return envInfo;
  }

  static writeEnvironmentInfo(
    envInfo: ClusterEnvironmentInfo,
    allureResultsDir: string,
    shouldWrite = true,
  ): void {
    if (!shouldWrite) {
      logger.info('Skipping environment file write (handled by shard 1)');
      return;
    }

    try {
      if (!fs.existsSync(allureResultsDir)) {
        fs.mkdirSync(allureResultsDir, { recursive: true });
      }

      const propertiesPath = path.join(allureResultsDir, 'environment.properties');
      const propertiesContent = Object.entries(envInfo)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      fs.writeFileSync(propertiesPath, propertiesContent, 'utf-8');
      logger.info(`Allure environment information written to ${propertiesPath}`);

      const jsonPath = path.join(allureResultsDir, 'environment.json');
      fs.writeFileSync(jsonPath, JSON.stringify(envInfo, null, 2), 'utf-8');
      logger.info(`Allure environment information written to ${jsonPath}`);
    } catch (error) {
      logger.error(`Failed to write Allure environment information: ${error}`);
    }
  }

  static async setupAllureEnvironment(
    _baseNamespace: string,
    allureResultsDir: string,
    kubeconfig?: string,
    shardingInfo?: { totalShards: number; currentShard: number },
  ): Promise<void> {
    if (EnvVariables.isDebugMode) {
      logger.info('Debug mode enabled — skipping Allure cluster metadata collection');
      return;
    }

    logger.info('Collecting cluster information for Allure report...');
    const envInfo = this.collectClusterInfo(kubeconfig);
    const shouldWrite = !shardingInfo || shardingInfo.currentShard === 1;
    this.writeEnvironmentInfo(envInfo, allureResultsDir, shouldWrite);
    logger.success('Cluster information collected for Allure report');
  }
}
