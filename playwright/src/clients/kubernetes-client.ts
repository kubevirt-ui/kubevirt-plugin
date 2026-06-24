import * as fs from 'fs';

import type * as http from 'http';
import type * as https from 'https';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import * as k8s from '@kubernetes/client-node';
import type { Page } from '@playwright/test';

import { ClusterSetupHandler } from './handlers/cluster-setup-handler';
import { CustomResourceCrudHandler } from './handlers/custom-resource-crud-handler';
import { DataVolumeHandler } from './handlers/data-volume-handler';
import { HyperConvergedHandler } from './handlers/hco-handler';
import type { KubernetesHandlerContext } from './handlers/kubernetes-api-context';
import { NamespaceHandler } from './handlers/namespace-handler';
import { NodeHandler } from './handlers/node-handler';
import { SecretConfigMapHandler } from './handlers/secret-configmap-handler';
import { SnapshotHandler } from './handlers/snapshot-handler';
import { TemplateHandler } from './handlers/template-handler';
import { VirtualMachineHandler } from './handlers/vm-handler';
import type { ClusterAuthConfig } from './base-client';
import BaseClient from './base-client';
import {
  createProxyAgent,
  generateKubeconfig,
  getOAuthToken,
  getProxyUrl,
} from './kubernetes-auth';
import type { KubernetesClientClusterMethods } from './kubernetes-client-cluster';
import { applyClusterDelegations } from './kubernetes-client-cluster';
import type { KubernetesClientResourceMethods } from './kubernetes-client-resources';
import { applyResourceDelegations } from './kubernetes-client-resources';
import type { KubernetesClientVmMethods } from './kubernetes-client-vm';
import { applyVmDelegations } from './kubernetes-client-vm';
import { makeKubernetesProxyRequest } from './kubernetes-proxy';

/**
 * Kubernetes API client for interacting with OpenShift/Kubernetes clusters.
 * Supports token-based, kubeconfig, and username/password authentication.
 *
 * @extends BaseClient
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class KubernetesClient extends BaseClient implements KubernetesHandlerContext {
  private static hasShownAuthWarning = false;

  private appsApi: k8s.AppsV1Api;
  private coApi: k8s.CustomObjectsApi;
  private k8sApi: k8s.CoreV1Api;
  private rbacAuthorizationApi: k8s.RbacAuthorizationV1Api;
  private readonly customResource: CustomResourceCrudHandler;
  private kubeConfig: k8s.KubeConfig;
  private kubeConfigPath?: string;

  static readonly getOAuthToken = getOAuthToken;
  static readonly generateKubeconfig = generateKubeconfig;

  readonly vm!: VirtualMachineHandler;
  readonly namespace!: NamespaceHandler;
  readonly template!: TemplateHandler;
  readonly dataVolume!: DataVolumeHandler;
  readonly secret!: SecretConfigMapHandler;
  readonly node!: NodeHandler;
  readonly hco!: HyperConvergedHandler;
  readonly snapshot!: SnapshotHandler;
  readonly clusterSetup!: ClusterSetupHandler;

  constructor(
    page: Page | undefined,
    config: ClusterAuthConfig & { token?: string },
    kubeConfigPath?: string,
  ) {
    super(page, config);
    this.kubeConfig = new k8s.KubeConfig();

    let effectiveKubeConfigPath = kubeConfigPath;
    if (!effectiveKubeConfigPath) {
      effectiveKubeConfigPath = this.tryDiscoverKubeConfig();
    }

    if (effectiveKubeConfigPath && fs.existsSync(effectiveKubeConfigPath)) {
      try {
        fs.accessSync(effectiveKubeConfigPath, fs.constants.R_OK);
      } catch (error: unknown) {
        throw new Error(
          `Kubeconfig file is not readable: ${effectiveKubeConfigPath}. Error: ${getErrorMessage(
            error,
          )}.`,
        );
      }

      this.kubeConfig.loadFromFile(effectiveKubeConfigPath);
      this.kubeConfigPath = effectiveKubeConfigPath;

      const currentContext = this.kubeConfig.getCurrentContext();
      if (!currentContext) {
        throw new Error(
          `Kubeconfig file ${effectiveKubeConfigPath} does not have a current context set.`,
        );
      }
    } else if (config.token) {
      this.kubeConfig.loadFromOptions({
        clusters: [{ name: 'cluster', server: this.baseUrl, skipTLSVerify: true }],
        contexts: [{ cluster: 'cluster', name: 'context', user: 'user' }],
        currentContext: 'context',
        users: [{ name: 'user', token: config.token }],
      });
    } else {
      if (!KubernetesClient.hasShownAuthWarning) {
        KubernetesClient.hasShownAuthWarning = true;
        console.warn(
          '⚠️ WARNING: Using username/password authentication without token or kubeconfig. ' +
            'This may result in "system:anonymous" errors. ' +
            'Please ensure a kubeconfig file (via oc login) or token is provided.',
        );
      }

      this.kubeConfig.loadFromOptions({
        clusters: [{ name: 'cluster', server: this.baseUrl, skipTLSVerify: true }],
        contexts: [{ cluster: 'cluster', name: 'context', user: 'user' }],
        currentContext: 'context',
        users: [{ name: 'user', password: this.password, username: this.username }],
      });
    }

    const proxyUrlForTls = getProxyUrl();

    // Force HTTP/1.1 ALPN negotiation and share a single HTTPS agent across all
    // requests to prevent node-fetch v2 hanging on HTTP/2 and avoid connection-cycling 401s.
    // When HTTP(S)_PROXY is set, use an HTTP CONNECT tunnel for every API call.
    interface KubeConfigWithAgents {
      createAgent: (
        cluster: unknown,
        agentOptions: Record<string, unknown>,
      ) => http.Agent | https.Agent;
    }
    const kubeCfgRef = this.kubeConfig;
    const kc = kubeCfgRef as unknown as KubeConfigWithAgents;
    const origCreateAgent = kc.createAgent.bind(kubeCfgRef);
    let sharedAgent: https.Agent | null = null;
    kc.createAgent = (cluster: unknown, agentOptions: unknown) => {
      if (!sharedAgent) {
        const baseOpts =
          typeof agentOptions === 'object' && agentOptions !== null
            ? (agentOptions as Record<string, unknown>)
            : {};
        sharedAgent = proxyUrlForTls
          ? createProxyAgent(proxyUrlForTls)
          : (origCreateAgent(cluster, {
              ...baseOpts,
              ALPNProtocols: ['http/1.1'],
              keepAlive: true,
              keepAliveMsecs: 30000,
            }) as https.Agent);
      }
      return sharedAgent;
    };

    this.k8sApi = this.kubeConfig.makeApiClient(k8s.CoreV1Api);
    this.coApi = this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
    this.appsApi = this.kubeConfig.makeApiClient(k8s.AppsV1Api);
    this.rbacAuthorizationApi = this.kubeConfig.makeApiClient(k8s.RbacAuthorizationV1Api);

    const ctx = this as KubernetesHandlerContext;
    this.customResource = new CustomResourceCrudHandler(ctx);
    this.template = new TemplateHandler(ctx);
    this.dataVolume = new DataVolumeHandler(ctx);
    this.secret = new SecretConfigMapHandler(ctx);
    this.hco = new HyperConvergedHandler(ctx);
    this.snapshot = new SnapshotHandler(ctx);
    this.vm = new VirtualMachineHandler(ctx, this.template, this.dataVolume, this.secret);
    this.node = new NodeHandler(ctx, this.vm);
    this.namespace = new NamespaceHandler(ctx, this.secret, this.vm);
    this.clusterSetup = new ClusterSetupHandler(this);
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    label: string,
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<T> {
    const operationName = label;
    const initialDelayMs = delayMs;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        const errorMessage = getErrorMessage(error);

        const isTransientError =
          errorMessage.includes('socket disconnected') ||
          errorMessage.includes('TLS connection') ||
          errorMessage.includes('ECONNRESET') ||
          errorMessage.includes('ETIMEDOUT') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('socket hang up') ||
          errorMessage.includes('network socket') ||
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized');

        if (!isTransientError || attempt === maxRetries) {
          throw error;
        }

        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms: ${errorMessage}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  private tryDiscoverKubeConfig(): string | undefined {
    const path = require('path');
    const configPath = path.join(process.cwd(), '.kubeconfigs', 'test-config');
    return fs.existsSync(configPath) ? configPath : undefined;
  }

  // KubernetesHandlerContext API accessors
  get kc(): k8s.KubeConfig {
    return this.kubeConfig;
  }

  get coreV1Api(): k8s.CoreV1Api {
    return this.k8sApi;
  }

  get customObjectsApi(): k8s.CustomObjectsApi {
    return this.coApi;
  }

  get appsV1Api(): k8s.AppsV1Api {
    return this.appsApi;
  }

  get rbacApi(): k8s.RbacAuthorizationV1Api {
    return this.rbacAuthorizationApi;
  }

  getAppsV1Api(): k8s.AppsV1Api {
    return this.appsApi;
  }

  getCoreV1Api(): k8s.CoreV1Api {
    return this.k8sApi;
  }

  getCustomObjectsApi(): k8s.CustomObjectsApi {
    return this.coApi;
  }

  getKubeConfig(): k8s.KubeConfig {
    return this.kubeConfig;
  }

  getCurrentUserToken(): string | undefined {
    try {
      const user = this.kubeConfig.getCurrentUser();
      return user?.token;
    } catch {
      return undefined;
    }
  }

  async makeProxyRequest(method: string, apiPath: string, body?: unknown): Promise<unknown> {
    return makeKubernetesProxyRequest(this.kubeConfig, method, apiPath, body as KubernetesResource);
  }
}

// Declaration merging — domain methods implemented via prototype augmentation
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
interface KubernetesClient
  extends KubernetesClientVmMethods,
    KubernetesClientResourceMethods,
    KubernetesClientClusterMethods {}

export default KubernetesClient;

applyVmDelegations(KubernetesClient.prototype);
applyResourceDelegations(KubernetesClient.prototype);
applyClusterDelegations(KubernetesClient.prototype);
