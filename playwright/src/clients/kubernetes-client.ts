import * as fs from 'fs';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import { URL } from 'url';

import type * as http from 'http';
import type * as stream from 'stream';

import {
  type JsonPatchOp,
  type KubernetesCondition,
  type KubernetesResource,
  getErrorMessage,
} from '@/data-models/kubernetes-types';
import { logger } from '@/utils/logger';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
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
import { makeKubernetesProxyRequest } from './kubernetes-proxy';

/**
 * Kubernetes API client for interacting with OpenShift/Kubernetes clusters.
 *
 * This client leverages the official Kubernetes client library (@kubernetes/client-node)
 * to provide programmatic access to cluster resources via the Kubernetes API.
 * It supports both token-based and username/password authentication methods.
 *
 * The client provides comprehensive functionality for:
 * - Custom resource management (VMs, Templates, MigrationPolicies, DataVolumes)
 * - Core Kubernetes resource operations (Pods, Namespaces, etc.)
 * - Resource verification with polling and timeout support
 * - Error handling with detailed status codes
 * - Multiple authentication methods (kubeconfig file, token, username/password)
 *
 * Key features:
 * - Automatic retry logic for resource verification
 * - Comprehensive error handling with status code preservation
 * - Support for both namespaced and cluster-scoped resources
 * - Timeout-based polling for resource state verification
 *
 * @example
 * ```typescript
 * const config: ClusterAuthConfig = {
 *   baseUrl: 'https://api.example.com:6443',
 *   username: 'admin',
 *   password: 'password123',
 *   token: 'optional-token'
 * };
 * const k8sClient = new KubernetesClient(page, config);
 *
 * // Create and verify a VM
 * await k8sClient.createCustomResource('kubevirt.io', 'v1', 'default', 'virtualmachines', vmConfig);
 * const result = await k8sClient.verifyVmCreated('test-vm', 'default');
 * ```
 *
 * @extends BaseClient
 * @since 1.0.0
 * @see {@link https://github.com/kubernetes-client/javascript} for Kubernetes client documentation
 */
export default class KubernetesClient extends BaseClient implements KubernetesHandlerContext {
  private static hasShownAuthWarning = false;

  /** Kubernetes Apps V1 API client for deployments, statefulsets, etc. */
  private appsApi: k8s.AppsV1Api;

  /** Kubernetes Custom Objects API client for custom resources */
  private coApi: k8s.CustomObjectsApi;

  /** Generic custom-object CRUD + proxy-aware service delete */
  private readonly customResource: CustomResourceCrudHandler;

  /** Kubernetes Core V1 API client for core resources */
  private k8sApi: k8s.CoreV1Api;

  /** Kubernetes configuration object */
  private kubeConfig: k8s.KubeConfig;

  /** Path to the kubeconfig file for token refresh */
  private kubeConfigPath?: string;

  /** Kubernetes RBAC API client for RoleBindings */
  private rbacAuthorizationApi: k8s.RbacAuthorizationV1Api;

  readonly clusterSetup!: ClusterSetupHandler;

  readonly dataVolume!: DataVolumeHandler;

  readonly hco!: HyperConvergedHandler;

  readonly namespace!: NamespaceHandler;

  readonly node!: NodeHandler;

  readonly secret!: SecretConfigMapHandler;
  readonly snapshot!: SnapshotHandler;
  readonly template!: TemplateHandler;
  readonly vm!: VirtualMachineHandler;
  /**
   * Creates a new KubernetesClient instance.
   *
   * The constructor initializes the Kubernetes client with the provided authentication
   * configuration. It supports three authentication methods:
   * 1. Kubeconfig file path (if provided)
   * 2. Token-based authentication (if token is provided)
   * 3. Username/password authentication (fallback)
   *
   * @param page - Optional Playwright page instance for UI-based operations
   * @param config - Cluster authentication configuration with optional token
   * @param config.baseUrl - The base URL of the cluster API server
   * @param config.password - The password for authentication
   * @param config.token - Optional OC authentication token for Kubernetes API calls
   * @param config.username - The username for authentication
   * @param kubeConfigPath - Optional path to kubeconfig file for authentication
   * @since 1.0.0
   */
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
        logger.warn(
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

    const proxyUrlForTls = KubernetesClient.getProxyUrl();

    // Do not set NODE_TLS_REJECT_UNAUTHORIZED globally — Node prints a security warning and it
    // disables verification for every TLS socket in the process. Cluster TLS is handled via
    // kubeconfig skipTLSVerify / cluster CA, plus rejectUnauthorized: false on makeProxyRequest
    // and createProxyAgent() when using an HTTP CONNECT tunnel.

    // Force HTTP/1.1 ALPN negotiation to prevent node-fetch v2 hanging on
    // HTTP/2-capable servers (OpenShift API). node-fetch v2 doesn't support
    // HTTP/2 but the default ALPN allows the server to negotiate h2, causing
    // subsequent requests to hang on the reused TLS connection.
    // Share a single HTTPS agent across all requests. Creating a new agent per
    // request causes rapid TLS connection cycling that triggers 401s from the
    // OpenShift API server. A shared agent with HTTP/1.1 ALPN and keep-alive
    // reuses the TCP/TLS connection, avoiding both the HTTP/2 negotiation issue
    // in node-fetch v2 and the connection-cycling 401 problem.
    //
    // When HTTP(S)_PROXY is set (e.g. IPv6 jobs), @kubernetes/client-node must
    // use an HTTP CONNECT tunnel for every API call — not only makeProxyRequest.
    // Otherwise CoreV1Api (readNamespace, etc.) attempts a direct connection and
    // fails while verifyAuthentication via makeProxyRequest succeeds.
    interface KubeConfigWithAgents {
      createAgent: (
        cluster: unknown,
        agentOptions: Record<string, unknown>,
      ) => https.Agent | http.Agent;
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
          ? KubernetesClient.createProxyAgent(proxyUrlForTls)
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
  /**
   * Create an HTTPS agent that tunnels through an HTTP proxy.
   * Uses HTTP CONNECT method to establish a tunnel to the target host.
   *
   * @param proxyUrl - The proxy URL (e.g., http://proxy.example.com:3128)
   * @returns An HTTPS agent configured to use the proxy
   */
  private static createProxyAgent(proxyUrl: string): https.Agent {
    const proxy = new URL(proxyUrl);

    return new https.Agent({
      rejectUnauthorized: false,
      createConnection: (options, callback) => {
        const proxySocket = net.connect(
          {
            host: proxy.hostname,
            port: parseInt(proxy.port || '3128', 10),
          },
          () => {
            const connectReq = [
              `CONNECT ${options.host}:${options.port} HTTP/1.1`,
              `Host: ${options.host}:${options.port}`,
              'Connection: keep-alive',
              '',
              '',
            ].join('\r\n');
            proxySocket.write(connectReq);
          },
        );

        let responseData = '';
        const onData = (chunk: Buffer) => {
          responseData += chunk.toString();

          if (responseData.includes('\r\n\r\n')) {
            proxySocket.removeListener('data', onData);
            const [statusLine] = responseData.split('\r\n');
            const statusCode = parseInt(statusLine.split(' ')[1], 10);

            if (statusCode === 200) {
              callback(null, proxySocket);
            } else {
              const error = new Error(
                `Proxy CONNECT failed with status ${statusCode}: ${statusLine}`,
              );
              proxySocket.destroy();
              callback(error, undefined as unknown as stream.Duplex);
            }
          }
        };

        proxySocket.on('data', onData);
        proxySocket.on('error', (err) => {
          callback(err, undefined as unknown as stream.Duplex);
        });
      },
    } as https.AgentOptions);
  }
  static async generateKubeconfig(
    clusterUrl: string,
    username: string,
    password: string,
    outputPath: string,
  ): Promise<string> {
    const token = await KubernetesClient.getOAuthToken(clusterUrl, username, password);

    const kubeconfigYaml = `apiVersion: v1
kind: Config
clusters:
  - name: cluster
    cluster:
      server: ${clusterUrl}
      insecure-skip-tls-verify: true
contexts:
  - name: context
    context:
      cluster: cluster
      user: user
current-context: context
users:
  - name: user
    user:
      token: ${token}
`;

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, kubeconfigYaml, 'utf8');

    return outputPath;
  }
  private static async getOAuthServerUrl(clusterUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const url = new URL('/.well-known/oauth-authorization-server', clusterUrl);

      // Get proxy configuration if available
      const proxyUrl = KubernetesClient.getProxyUrl();
      const agent = proxyUrl ? KubernetesClient.createProxyAgent(proxyUrl) : undefined;

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        rejectUnauthorized: false,
        agent, // Use proxy agent if configured
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const config = JSON.parse(body);
            resolve(config.issuer || clusterUrl);
          } catch {
            resolve(clusterUrl);
          }
        });
      });

      req.on('error', () => {
        resolve(clusterUrl);
      });

      req.end();
    });
  }
  /**
   * Authenticate with OpenShift using username/password and get an OAuth token.
   * This uses the OpenShift OAuth server to exchange credentials for a bearer token.
   *
   * @param clusterUrl - The cluster API URL (e.g., https://api.cluster.example.com:6443)
   * @param username - The username to authenticate with
   * @param password - The password to authenticate with
   * @returns The OAuth bearer token
   * @throws Error if authentication fails
   */
  static async getOAuthToken(
    clusterUrl: string,
    username: string,
    password: string,
  ): Promise<string> {
    const oauthServerUrl = await KubernetesClient.getOAuthServerUrl(clusterUrl);

    return new Promise((resolve, reject) => {
      const authHeader = Buffer.from(`${username}:${password}`).toString('base64');
      const tokenUrl = new URL('/oauth/authorize', oauthServerUrl);
      tokenUrl.searchParams.set('response_type', 'token');
      tokenUrl.searchParams.set('client_id', 'openshift-challenging-client');

      // Get proxy configuration if available
      const proxyUrl = KubernetesClient.getProxyUrl();
      const agent = proxyUrl ? KubernetesClient.createProxyAgent(proxyUrl) : undefined;

      const options: https.RequestOptions = {
        hostname: tokenUrl.hostname,
        port: tokenUrl.port || 443,
        path: tokenUrl.pathname + tokenUrl.search,
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'X-CSRF-Token': '1',
        },
        rejectUnauthorized: false, // Skip TLS verification for self-signed certs
        agent, // Use proxy agent if configured
      };

      const req = https.request(options, (res) => {
        const location = res.headers.location;
        if (location && location.includes('access_token=')) {
          const match = location.match(/access_token=([^&]+)/);
          if (match) {
            resolve(match[1]);
            return;
          }
        }

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          reject(
            new Error(
              `OAuth authentication failed: HTTP ${res.statusCode}. Response: ${body.substring(
                0,
                200,
              )}`,
            ),
          );
        });
      });

      req.on('error', (err) => {
        reject(new Error(`OAuth request failed: ${err.message}`));
      });

      req.end();
    });
  }

  /**
   * Get the proxy URL from environment variables if configured.
   * Supports both HTTP_PROXY/HTTPS_PROXY and http_proxy/https_proxy.
   *
   * @returns The proxy URL string or undefined if no proxy is configured
   */
  private static getProxyUrl(): string | undefined {
    return (
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy
    );
  }

  /**
   * Try to discover kubeconfig file from standard locations.
   * Checks the .kubeconfigs directory for test config files.
   * @returns Path to kubeconfig file if found, undefined otherwise
   */
  private tryDiscoverKubeConfig(): string | undefined {
    const kubeConfigDir = path.join(process.cwd(), '.kubeconfigs');
    const shardIndex = EnvVariables.shardIndex;
    const fileName = shardIndex ? `shard-${shardIndex}-config` : 'test-config';
    const configPath = path.join(kubeConfigDir, fileName);

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    return undefined;
  }

  async addBlankDiskToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    size = '1Gi',
  ): Promise<void> {
    return this.vm.addBlankDiskToVm(vmName, namespace, diskName, size);
  }

  async addCdromDiskToVm(
    vmName: string,
    namespace: string,
    options?: { volumeName?: string; pvcClaimName?: string; containerImage?: string },
  ): Promise<void> {
    return this.vm.addCdromDiskToVm(vmName, namespace, options);
  }

  /**
   * Check if a DataVolume exists in the specified namespace
   * @param dataVolumeName - Name of the DataVolume
   * @param namespace - Namespace where the DataVolume should exist
   * @returns true if DataVolume exists, false otherwise
   */

  get appsV1Api(): k8s.AppsV1Api {
    return this.appsApi;
  }

  /**
   * Check whether a user can perform a specific action on a resource via LocalSubjectAccessReview.
   * Requires admin privileges (the calling client must be able to create access reviews).
   */
  async canUserPerformAction(
    username: string,
    namespace: string,
    verb: string,
    group: string,
    resource: string,
  ): Promise<boolean> {
    return this.clusterSetup.canUserPerformAction(username, namespace, verb, group, resource);
  }

  async cleanupTestNamespace(namespace: string): Promise<void> {
    return this.namespace.cleanupTestNamespace(namespace);
  }

  async cloneVirtualMachine(
    sourceVmName: string,
    targetVmName: string,
    namespace: string,
    startAfterClone = false,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ) {
    return this.vm.cloneVirtualMachine(
      sourceVmName,
      targetVmName,
      namespace,
      startAfterClone,
      timeoutMs,
    );
  }

  async cordonNode(nodeName: string): Promise<void> {
    return this.node.cordonNode(nodeName);
  }

  get coreV1Api(): k8s.CoreV1Api {
    return this.k8sApi;
  }

  async createBlankDataVolume(
    dataVolumeName: string,
    namespace: string,
    size = '1Gi',
  ): Promise<KubernetesResource> {
    return this.dataVolume.createBlankDataVolume(dataVolumeName, namespace, size);
  }

  /**
   * Create a cluster-scoped custom resource
   */
  async createClusterCustomResource(group: string, version: string, plural: string, body: unknown) {
    return this.customResource.createClusterCustomResource(group, version, plural, body);
  }

  /**
   * Creates a custom resource in the specified namespace.
   *
   * This method provides a generic way to create any custom Kubernetes resource
   * by specifying the API group, version, namespace, and resource type.
   *
   * @param group - The API group of the custom resource (e.g., 'kubevirt.io')
   * @param version - The API version of the custom resource (e.g., 'v1')
   * @param namespace - The namespace where the resource should be created
   * @param plural - The plural name of the resource type (e.g., 'virtualmachines')
   * @param body - The resource configuration object
   * @returns The created resource object
   * @throws {Error} When resource creation fails
   * @since 1.0.0
   */
  async createCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    body: unknown,
  ) {
    return this.customResource.createCustomResource(group, version, namespace, plural, body);
  }

  async createFedoraTemplateWithDataVolumeRootDisk(templateName: string, namespace: string) {
    return this.template.createFedoraTemplateWithDataVolumeRootDisk(templateName, namespace);
  }

  async createNamespace(name: string, labels?: Record<string, string>): Promise<boolean> {
    return this.namespace.createNamespace(name, labels);
  }

  /**
   * POST /api/v1/namespaces. Uses makeProxyRequest when a proxy is set (same rationale as getNamespaceByName).
   */
  async createNamespaceResource(body: k8s.V1Namespace): Promise<void> {
    return this.clusterSetup.createNamespaceResource(body);
  }

  async createPvc(
    name: string,
    namespace: string,
    size = '10Gi',
    storageClassName?: string,
    accessModes: string[] = ['ReadWriteOnce'],
  ): Promise<k8s.V1PersistentVolumeClaim> {
    return this.secret.createPvc(name, namespace, size, storageClassName, accessModes);
  }

  async createSecret(
    name: string,
    namespace: string,
    data: { [key: string]: string },
    type = 'Opaque',
  ): Promise<k8s.V1Secret> {
    return this.secret.createSecret(name, namespace, data, type);
  }

  async createSSHKeySecret(
    name: string,
    namespace: string,
    sshPublicKey?: string,
  ): Promise<KubernetesResource> {
    const secret = await this.secret.createSSHKeySecret(name, namespace, sshPublicKey);
    return secret as unknown as KubernetesResource;
  }

  async createSysprepConfigMap(
    name: string,
    namespace: string,
    unattendXml?: string,
  ): Promise<KubernetesResource> {
    const cm = await this.secret.createSysprepConfigMap(name, namespace, unattendXml);
    return cm as unknown as KubernetesResource;
  }

  async createTlsCaCertConfigMap(
    name: string,
    namespace: string,
    caPem: string,
  ): Promise<k8s.V1ConfigMap> {
    return this.secret.createTlsCaCertConfigMap(name, namespace, caPem);
  }

  async createVmFromInstanceType(
    volumeName: string,
    vmName: string,
    namespace: string,
    series = 'U series',
    instanceTypeSize = 'small',
    startAfterCreation = true,
    volumeNamespace = 'openshift-virtualization-os-images',
    storageClassName?: string,
    rootDiskName = 'rootdisk',
  ) {
    return this.vm.createVmFromInstanceType(
      volumeName,
      vmName,
      namespace,
      series,
      instanceTypeSize,
      startAfterCreation,
      volumeNamespace,
      storageClassName,
      rootDiskName,
    );
  }

  /**
   * Get the number of namespaces (projects) in the cluster.
   * Optionally exclude system namespaces (kube-*, openshift-*) to match UI "Projects" count.
   * @param excludeSystem - If true, exclude kube-*, openshift-*, and default (default: true)
   * @param onlyWithVms - If true, count only namespaces that have at least one VM (matches UI tree)
   */

  async createVmFromTemplate(
    templateMetadataName: string,
    vmName: string,
    namespace: string,
    templateNamespace = 'openshift',
    startAfterCreation = true,
    sysprepConfigMapName?: string,
    cloudInitConfig?: { username?: string; password?: string },
    vmCustomization?: {
      description?: string;
      cpu?: number;
      memory?: number;
      bootMode?: 'BIOS' | 'UEFI' | 'UEFI (secure)';
      workload?: string;
      hostname?: string;
      headless?: boolean;
    },
    storageClassName?: string,
    folderName?: string,
  ) {
    return this.vm.createVmFromTemplate(
      templateMetadataName,
      vmName,
      namespace,
      templateNamespace,
      startAfterCreation,
      sysprepConfigMapName,
      cloudInitConfig,
      vmCustomization,
      storageClassName,
      folderName,
    );
  }

  /**
   * Get HCO status and installed version for VM Overview cluster status validation.
   * Status is derived from status.conditions (e.g. Degraded, Available).
   * Version is taken from status.versions (e.g. cnv or kubevirt component).
   */

  /**
   * Get list of nodes that are available for VM migration (matching UI filtering)
   * The migration UI filters nodes based on:
   * 1. Ready status (Ready=True)
   * 2. Worker role label (node-role.kubernetes.io/worker)
   * 3. Schedulable (not SchedulingDisabled)
   * 4. Optionally excludes the current node where the VM is running
   * @param excludeNodeName - Optional node name to exclude (e.g., current VM node)
   * @returns Array of Node resources available for migration
   */

  /**
   * Get a Template resource
   * @param templateName - Name of the Template
   * @param namespace - Namespace where the Template exists
   * @returns The Template resource
   */

  async createVmSnapshot(
    snapshotName: string,
    vmName: string,
    namespace: string,
  ): Promise<KubernetesResource> {
    return this.snapshot.createVmSnapshot(snapshotName, vmName, namespace);
  }

  async createVolumeSnapshot(
    snapshotName: string,
    namespace: string,
    sourcePvcName: string,
    volumeSnapshotClassName?: string,
  ): Promise<KubernetesResource> {
    return this.snapshot.createVolumeSnapshot(
      snapshotName,
      namespace,
      sourcePvcName,
      volumeSnapshotClassName,
    );
  }

  get customObjectsApi(): k8s.CustomObjectsApi {
    return this.coApi;
  }

  async dataSourceExists(dataSourceName: string, namespace: string): Promise<boolean> {
    return this.dataVolume.dataSourceExists(dataSourceName, namespace);
  }

  async dataVolumeExists(dataVolumeName: string, namespace: string): Promise<boolean> {
    return this.dataVolume.dataVolumeExists(dataVolumeName, namespace);
  }

  /**
   * Delete all resources of a specific kind in a namespace.
   * This is used for cleanup operations.
   *
   * @param group - API group (e.g., 'kubevirt.io')
   * @param version - API version (e.g., 'v1')
   * @param plural - Resource plural name (e.g., 'virtualmachines')
   * @param namespace - The namespace to clean up
   * @param options - Optional settings
   * @since 1.0.0
   */
  async deleteAllCustomResources(
    group: string,
    version: string,
    plural: string,
    namespace: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void> {
    return this.customResource.deleteAllCustomResources(group, version, plural, namespace, options);
  }

  async deleteAllSecrets(namespace: string, options?: { ignoreErrors?: boolean }): Promise<void> {
    return this.secret.deleteAllSecrets(namespace, options);
  }

  /**
   * Delete a cluster-scoped custom resource
   */
  async deleteClusterCustomResource(group: string, version: string, plural: string, name: string) {
    return this.customResource.deleteClusterCustomResource(group, version, plural, name);
  }

  async deleteClusterRoleBinding(name: string): Promise<void> {
    return this.namespace.deleteClusterRoleBinding(name);
  }

  // =====================================================================
  // Global Setup/Teardown Support Methods
  // These methods replace OC CLI operations for test environment management
  // =====================================================================

  async deleteConfigMapsWithPrefix(
    namespace: string,
    prefix: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void> {
    return this.secret.deleteConfigMapsWithPrefix(namespace, prefix, options);
  }

  /**
   * Example: Delete a custom resource
   */
  async deleteCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ) {
    return this.customResource.deleteCustomResource(group, version, namespace, plural, name);
  }

  async deleteNamespace(name: string, options?: { ignoreNotFound?: boolean }): Promise<boolean> {
    return this.namespace.deleteNamespace(name, options);
  }

  /**
   * DELETE /api/v1/namespaces/{namespace}/services/{name}. Uses makeProxyRequest when HTTP(S)_PROXY is set.
   */
  async deleteNamespacedService(namespace: string, name: string): Promise<void> {
    return this.customResource.deleteNamespacedService(namespace, name);
  }

  async deletePvc(
    name: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean },
  ): Promise<boolean> {
    return this.secret.deletePvc(name, namespace, options);
  }

  async deleteSecret(name: string, namespace: string): Promise<boolean> {
    return this.secret.deleteSecret(name, namespace);
  }

  async deleteVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    timeoutMs = 30000,
  ): Promise<boolean> {
    return this.snapshot.deleteVolumesnapshotsByLabel(namespace, labels, timeoutMs);
  }

  async disableDeleteProtection(vmName: string, namespace: string) {
    return this.vm.disableDeleteProtection(vmName, namespace);
  }

  async disableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    return this.hco.disableNativeVmTemplateFeatureGate(name, namespace);
  }

  /**
   * Disable virtualization welcome modal, guided tour, and getting started settings via K8s API.
   * Patches the kubevirt-user-settings ConfigMap to set:
   * - quickStart.dontShowWelcomeModal = true (disables the welcome modal)
   * - quickStart.activeQuickStartID = "" (clears any active quick start)
   * - guidedTour = false (disables the virtualization guided tour)
   * - onboardingPopoversHidden = { vmsTab, catalog, createProject } (suppresses info popovers)
   *
   * Patches both the username key and (optionally) the user UID key, since the
   * kubevirt plugin may look up settings by UID rather than username.
   *
   * @param cnvNamespace - The CNV namespace (default: 'openshift-cnv')
   * @param username - The username key in the ConfigMap (default: 'kube-admin')
   * @param userUid - Optional user UID to also patch (resolved via getUserUid)
   * @returns true if settings were patched, false if ConfigMap doesn't exist or patch failed
   */
  async disableVirtualizationWelcomeSettings(
    cnvNamespace = 'openshift-cnv',
    username = 'kube-admin',
    userUid?: string,
  ): Promise<boolean> {
    return this.clusterSetup.disableVirtualizationWelcomeSettings(cnvNamespace, username, userUid);
  }

  async enableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    return this.hco.enableNativeVmTemplateFeatureGate(name, namespace);
  }

  async enableNodePortFeature(
    enabled = true,
    nodePortAddress?: string,
    cnvNamespace = 'openshift-cnv',
  ) {
    return this.vm.enableNodePortFeature(enabled, nodePortAddress, cnvNamespace);
  }

  async enableSshAccess(
    vmName: string,
    namespace: string,
    sshServiceType: 'NodePort' | 'LoadBalancer' = 'NodePort',
  ) {
    return this.vm.enableSshAccess(vmName, namespace, sshServiceType);
  }

  /**
   * Check if Cluster Observability Operator (COO) is installed and uninstall it if so.
   * Removes OLM Subscriptions and ClusterServiceVersions in openshift-cluster-observability-operator
   * so the test can run from a clean state and the UI does not show "Subscription already exists".
   */
  async ensureClusterObservabilityOperatorUninstalled(): Promise<void> {
    return this.clusterSetup.ensureClusterObservabilityOperatorUninstalled();
  }

  /** RBAC for network latency checkup tests  */
  async ensureNetworkCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }> {
    return this.namespace.ensureNetworkCheckupPermissions(namespace);
  }

  async ensureNonPrivUserExists(username: string, password = 'test'): Promise<boolean> {
    return this.namespace.ensureNonPrivUserExists(username, password);
  }

  /**
   * Ensures an OVN layer2 NetworkAttachmentDefinition exists; tracks it for cleanup when created.
   *
   */
  async ensureOvnNadExists(
    nadName: string,
    namespace: string,
  ): Promise<{
    created: boolean;
    alreadyExisted: boolean;
  }> {
    const result = await this.namespace.ensureOvnNadExists(nadName, namespace);
    if (result.created) {
      this.trackResource('NetworkAttachmentDefinition', nadName, namespace);
    }
    return result;
  }

  /** RBAC + ServiceAccount for storage checkup flows  */
  async ensureStorageCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }> {
    return this.namespace.ensureStorageCheckupPermissions(namespace);
  }

  async ensureVmFoldersEnabled(cnvNamespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    return this.vm.ensureVmFoldersEnabled(cnvNamespace);
  }

  async findTemplateByMetadataName(metadataName: string, namespace = 'openshift') {
    return this.template.findTemplateByMetadataName(metadataName, namespace);
  }

  /**
   * Get the AppsV1Api client for interacting with deployments, statefulsets, etc.
   */
  getAppsV1Api(): k8s.AppsV1Api {
    return this.appsApi;
  }

  /**
   * Get a cluster-scoped custom resource (not namespaced)
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @returns The custom resource
   */
  async getClusterCustomResource(group: string, version: string, plural: string, name: string) {
    return this.customResource.getClusterCustomResource(group, version, plural, name);
  }

  /**
   * Get total count of VirtualMachines across all namespaces (cluster-wide).
   * Used to validate the VM Overview cluster-level "VMs" metric card.
   */
  async getClusterVirtualMachineCount(): Promise<number> {
    const namespaces = await this.getNamespaces();
    let total = 0;
    for (const ns of namespaces) {
      const vms = await this.listVirtualMachines(ns);
      total += vms.length;
    }
    return total;
  }

  async getConfigMap(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.secret.getConfigMap(name, namespace);
  }

  /**
   * Get the CoreV1Api client for interacting with core Kubernetes resources
   */
  getCoreV1Api(): k8s.CoreV1Api {
    return this.k8sApi;
  }

  /**
   * Get the current user's authentication token from the kubeconfig.
   * This is used to pass the token to other clients or for API calls.
   *
   * @returns The authentication token or undefined if not available
   * @since 1.0.0
   */
  getCurrentUserToken(): string | undefined {
    try {
      const user = this.kubeConfig.getCurrentUser();
      return user?.token;
    } catch {
      return undefined;
    }
  }

  /**
   * Get the CustomObjectsApi client for interacting with custom resources (like VMs)
   */
  getCustomObjectsApi(): k8s.CustomObjectsApi {
    return this.coApi;
  }

  /**
   * Example: Get a custom resource (like a VirtualMachine)
   */
  async getCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ) {
    return this.customResource.getCustomResource(group, version, namespace, plural, name);
  }

  async getHyperConverged(name = 'kubevirt-hyperconverged', namespace = 'openshift-cnv') {
    return this.hco.getHyperConverged(name, namespace);
  }

  async getHyperConvergedField(
    jsonPath: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<string | undefined> {
    return this.hco.getHyperConvergedField(jsonPath, name, namespace);
  }

  async getHyperConvergedStatusAndVersion(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<{ status: string; version: string | undefined }> {
    return this.hco.getHyperConvergedStatusAndVersion(name, namespace);
  }

  /**
   * Get the raw KubeConfig object
   */
  getKubeConfig(): k8s.KubeConfig {
    return this.kubeConfig;
  }

  /**
   * Get a MigrationPolicy resource
   * @param policyName - Name of the MigrationPolicy
   * @returns The MigrationPolicy resource
   */
  async getMigrationPolicy(policyName: string) {
    return await this.getClusterCustomResource(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
      policyName,
    );
  }

  async getMigrationTargetNodes(excludeNodeName?: string): Promise<KubernetesResource[]> {
    return this.node.getMigrationTargetNodes(excludeNodeName);
  }

  /**
   * GET /api/v1/namespaces/{name}. Uses makeProxyRequest when a proxy is set so IPv6 CI jobs
   * match verifyAuthentication; CoreV1Api.readNamespace may not honor the patched createAgent.
   */
  async getNamespaceByName(name: string): Promise<k8s.V1Namespace | undefined> {
    return this.clusterSetup.getNamespaceByName(name);
  }

  async getNamespaceCount(excludeSystem = true, onlyWithVms = false): Promise<number> {
    return this.namespace.getNamespaceCount(excludeSystem, onlyWithVms);
  }

  /**
   * Get expected resource allocation for a namespace (running VMs, vCPU, memory MiB, storage GiB).
   * Used to validate VM Overview resource allocation cards.
   */
  async getNamespaceResourceAllocationForOverview(namespace: string): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    return this.namespace.getNamespaceResourceAllocationForOverview(namespace);
  }

  async getNamespaces(): Promise<string[]> {
    return this.namespace.getNamespaces();
  }

  async getNativeVmTemplate(templateName: string, namespace: string) {
    return this.template.getNativeVmTemplate(templateName, namespace);
  }

  getNodeNameWithLowerAllocatable(nodes: KubernetesResource[]): string | undefined {
    return this.node.getNodeNameWithLowerAllocatable(nodes);
  }

  async getNodes() {
    return this.node.getNodes();
  }

  async getNodesWithVmsInNamespace(namespace: string): Promise<string[]> {
    return this.node.getNodesWithVmsInNamespace(namespace);
  }

  /**
   * Example: Get a list of pods in a namespace
   */
  async getPods(namespace: string) {
    return this.namespace.getPods(namespace);
  }

  async getReadyNodes() {
    return this.node.getReadyNodes();
  }

  /**
   * Returns StorageClass resource names in the cluster.
   */
  async getStorageClassNames(): Promise<string[]> {
    return this.clusterSetup.getStorageClassNames();
  }

  async getTemplate(templateName: string, namespace: string) {
    return this.template.getTemplate(templateName, namespace);
  }

  getTemplateBootDataSourceRef(
    template: KubernetesResource,
    defaultDataSourceNamespace = 'openshift-virtualization-os-images',
  ): { name: string; namespace: string } | null {
    return this.template.getTemplateBootDataSourceRef(template, defaultDataSourceNamespace);
  }

  /**
   * Resolve an OpenShift user's UID via the User API (user.openshift.io/v1).
   * Returns undefined if the user doesn't exist or the API is unavailable.
   */
  async getUserUid(username: string): Promise<string | undefined> {
    return this.clusterSetup.getUserUid(username);
  }

  async getVirtualMachine(vmName: string, namespace: string) {
    return this.vm.getVirtualMachine(vmName, namespace);
  }

  async getVirtualMachineInstance(vmName: string, namespace: string) {
    return this.vm.getVirtualMachineInstance(vmName, namespace);
  }

  async getVirtualMachineSnapshot(
    snapshotName: string,
    namespace: string,
  ): Promise<KubernetesResource> {
    return this.snapshot.getVirtualMachineSnapshot(snapshotName, namespace);
  }

  async getVmiCpuSockets(vmName: string, namespace: string): Promise<string | null> {
    return this.vm.getVmiCpuSockets(vmName, namespace);
  }

  async getVmiDiskBus(vmName: string, namespace: string, diskName: string): Promise<string | null> {
    return this.vm.getVmiDiskBus(vmName, namespace, diskName);
  }

  async getVmiFilesystemList(vmName: string, namespace: string) {
    return this.vm.getVmiFilesystemList(vmName, namespace);
  }

  async getVmiMemoryGuest(vmName: string, namespace: string): Promise<string | null> {
    return this.vm.getVmiMemoryGuest(vmName, namespace);
  }

  async getVmIpAddress(vmName: string, namespace: string): Promise<string | null> {
    return this.vm.getVmIpAddress(vmName, namespace);
  }

  async getVmNodeName(vmName: string, namespace: string): Promise<string | null> {
    return this.node.getVmNodeName(vmName, namespace);
  }

  async getVolumeSnapshotNameFromVirtualMachineSnapshot(
    virtualMachineSnapshotName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.DATA_VOLUME_STATUS,
    singleAttempt = false,
  ): Promise<string> {
    return this.snapshot.getVolumeSnapshotNameFromVirtualMachineSnapshot(
      virtualMachineSnapshotName,
      namespace,
      timeoutMs,
      singleAttempt,
    );
  }

  async getVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    namePattern?: string,
    timeoutMs = 60000,
  ): Promise<KubernetesResource[]> {
    return this.snapshot.getVolumesnapshotsByLabel(namespace, labels, namePattern, timeoutMs);
  }

  async grantUserAccessToNamespace(namespace: string, username: string): Promise<void> {
    return this.namespace.grantUserAccessToNamespace(namespace, username);
  }

  async grantUserCdiClusterReadAccess(username: string): Promise<void> {
    return this.namespace.grantUserCdiClusterReadAccess(username);
  }

  async grantUserClusterViewAccess(username: string): Promise<void> {
    return this.namespace.grantUserClusterViewAccess(username);
  }

  async grantUserHotplugSubresourceAccess(namespace: string, username: string): Promise<void> {
    return this.namespace.grantUserHotplugSubresourceAccess(namespace, username);
  }

  async grantUserKubevirtAccessToNamespace(namespace: string, username: string): Promise<void> {
    return this.namespace.grantUserKubevirtAccessToNamespace(namespace, username);
  }

  async grantUserTemplateListAccess(namespace: string, username: string): Promise<void> {
    return this.namespace.grantUserTemplateListAccess(namespace, username);
  }

  async grantUserViewAccessToNamespace(namespace: string, username: string): Promise<void> {
    return this.namespace.grantUserViewAccessToNamespace(namespace, username);
  }

  async hotplugVolumeToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    dataVolumeName: string,
  ): Promise<void> {
    return this.vm.hotplugVolumeToVm(vmName, namespace, diskName, dataVolumeName);
  }

  /**
   * Check if Cluster Observability Operator (COO) is installed via OLM.
   * Returns true if any subscription in openshift-cluster-observability-operator has status.installedCSV set.
   */
  async isClusterObservabilityOperatorInstalled(): Promise<boolean> {
    return this.clusterSetup.isClusterObservabilityOperatorInstalled();
  }

  async isClusterSingleNode(): Promise<boolean> {
    return this.node.isClusterSingleNode();
  }

  async isDataSourceReady(name: string, namespace: string): Promise<boolean> {
    try {
      const ds = (await this.getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datasources',
        name,
      )) as KubernetesResource;
      const conditions = ds?.status?.conditions;
      const list = Array.isArray(conditions) ? conditions : [];
      return list.some((c: KubernetesCondition) => c.type === 'Ready' && c.status === 'True');
    } catch {
      return false;
    }
  }

  async isNativeVmTemplateFeatureGateEnabled(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    return this.hco.isNativeVmTemplateFeatureGateEnabled(name, namespace);
  }

  async isVmDiskPersistent(vmName: string, namespace: string, diskName: string): Promise<boolean> {
    return this.vm.isVmDiskPersistent(vmName, namespace, diskName);
  }

  get kc(): k8s.KubeConfig {
    return this.kubeConfig;
  }

  /**
   * Create a VM from a template using the Kubernetes API
   * Processes the template and creates the VM resource
   * @param templateMetadataName - The template metadata name (e.g., 'rhel9-server-small')
   * @param vmName - Name for the VM to create
   * @param namespace - Namespace where the VM should be created
   * @param templateNamespace - Namespace where the template exists (default: 'openshift')
   * @param startAfterCreation - Whether to start the VM after creation (default: true)
   * @param sysprepConfigMapName - Optional ConfigMap name for Windows sysprep
   * @param cloudInitConfig - Optional cloud-init configuration for Linux VMs
   * @param vmCustomization - Optional VM customization (CPU, memory, etc.)
   * @param storageClassName - Optional storage class name for the root disk (e.g., 'ocs-storagecluster-ceph-rbd')
   * @returns The created VM resource
   */
  /**
   * List cluster-scoped custom resources (not namespaced)
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @returns Array of custom resources
   */
  async listClusterCustomResources(group: string, version: string, plural: string) {
    return this.customResource.listClusterCustomResources(group, version, plural);
  }

  /**
   * List custom resources in a namespace
   * @param group - API group
   * @param version - API version
   * @param namespace - Namespace to list from
   * @param plural - Resource plural name
   * @returns Array of custom resources
   */
  async listCustomResources(group: string, version: string, namespace: string, plural: string) {
    return this.customResource.listCustomResources(group, version, namespace, plural);
  }

  /**
   * List all MigrationPolicies in the cluster
   * @returns Array of MigrationPolicy resources
   */
  async listMigrationPolicies() {
    return await this.listClusterCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
    );
  }

  async listTemplates(namespace: string) {
    return this.template.listTemplates(namespace);
  }

  async listVirtualMachines(namespace: string) {
    return this.vm.listVirtualMachines(namespace);
  }

  async listVolumeSnapshotsInNamespace(namespace: string): Promise<KubernetesResource[]> {
    return this.snapshot.listVolumeSnapshotsInNamespace(namespace);
  }

  /**
   * Make a raw Kubernetes API request through the proxy tunnel.
   * This bypasses @kubernetes/client-node which uses node-fetch (incompatible with proxy).
   *
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param path - API path (e.g., '/api/v1/namespaces')
   * @param body - Optional request body (will be JSON stringified)
   * @returns Parsed JSON response
   * @throws {Error} When request fails
   */
  async makeProxyRequest(
    method: string,
    apiPath: string,
    body?: KubernetesResource | JsonPatchOp[] | k8s.V1Namespace,
  ): Promise<unknown> {
    return makeKubernetesProxyRequest(this.kubeConfig, method, apiPath, body);
  }

  /**
   * Check if a MigrationPolicy exists
   * @param policyName - Name of the MigrationPolicy
   * @returns true if MigrationPolicy exists, false otherwise
   */
  async migrationPolicyExists(policyName: string): Promise<boolean> {
    return this.namespace.migrationPolicyExists(policyName);
  }

  async namespaceExists(name: string): Promise<boolean> {
    return this.namespace.namespaceExists(name);
  }

  /**
   * Patch a cluster-scoped custom resource using merge-patch.
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @param patchBody - The patch body to apply
   * @returns The patched resource
   * @since 1.0.0
   */
  async patchClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchBody:
      | JsonPatchOp[]
      | Record<string, unknown>
      | ReadonlyArray<{ op: string; path: string; value?: unknown }>,
  ) {
    return this.customResource.patchClusterCustomResource(
      group,
      version,
      plural,
      name,
      patchBody as JsonPatchOp[] | Record<string, unknown>,
    );
  }

  /**
   * Patch a cluster-scoped resource using JSON Patch (RFC 6902).
   * Use this when the client's default Content-Type is application/json-patch+json.
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @param patchOps - JSON Patch operations array (e.g. [{ op: 'add', path: '/metadata/annotations/key', value: 'v' }])
   * @returns The patched resource
   */
  async patchClusterCustomResourceWithJsonPatch(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchOps: Array<{ op: 'add' | 'remove' | 'replace'; path: string; value?: unknown }>,
  ) {
    return this.customResource.patchClusterCustomResourceWithJsonPatch(
      group,
      version,
      plural,
      name,
      patchOps,
    );
  }

  async patchConfigMap(
    name: string,
    namespace: string,
    patchData: Record<string, string>,
  ): Promise<KubernetesResource> {
    const cm = await this.secret.patchConfigMap(name, namespace, patchData);
    return cm as unknown as KubernetesResource;
  }

  async patchDataSourceAnnotations(
    dataSourceName: string,
    namespace: string,
    annotations: Record<string, string>,
  ): Promise<void> {
    return this.dataVolume.patchDataSourceAnnotations(dataSourceName, namespace, annotations);
  }

  async patchHyperConverged(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
    patchOps: Array<{ op: string; path: string; value?: unknown }>,
  ) {
    return this.hco.patchHyperConverged(name, namespace, patchOps as JsonPatchOp[]);
  }

  /**
   * Patch a namespaced custom resource using merge-patch.
   * @param group - API group (e.g., 'kubevirt.io')
   * @param version - API version (e.g., 'v1')
   * @param plural - Resource plural name (e.g., 'virtualmachines')
   * @param name - Resource name
   * @param namespace - Kubernetes namespace
   * @param patchBody - The patch body to apply
   * @returns The patched resource
   */
  async patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace: string,
    patchBody:
      | JsonPatchOp[]
      | Record<string, unknown>
      | ReadonlyArray<{ op: string; path: string; value?: unknown }>,
  ) {
    return this.customResource.patchResource(
      group,
      version,
      plural,
      name,
      namespace,
      patchBody as JsonPatchOp[] | Record<string, unknown>,
    );
  }

  async patchVirtualMachineInstanceStatus(
    vmiName: string,
    namespace: string,
    conditions: Array<{
      type: string;
      status: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>,
  ) {
    return this.vm.patchVirtualMachineInstanceStatus(vmiName, namespace, conditions);
  }

  async patchVirtualMachineNodeSelector(
    vmName: string,
    namespace: string,
    nodeSelector: { [key: string]: string },
  ) {
    return this.vm.patchVirtualMachineNodeSelector(vmName, namespace, nodeSelector);
  }

  async patchVirtualMachineResources(
    vmName: string,
    namespace: string,
    resources: { cpuSockets?: number; cpuCores?: number; memory?: string },
  ) {
    return this.vm.patchVirtualMachineResources(vmName, namespace, resources);
  }

  async patchVirtualMachineRunStrategy(
    vmName: string,
    namespace: string,
    runStrategy: 'Always' | 'Manual' | 'RerunOnFailure',
  ) {
    return this.vm.patchVirtualMachineRunStrategy(vmName, namespace, runStrategy);
  }

  async patchVmDeschedulerEvictAnnotation(
    vmName: string,
    namespace: string,
    enabled: boolean,
  ): Promise<void> {
    return this.vm.patchVmDeschedulerEvictAnnotation(vmName, namespace, enabled);
  }

  async patchVmEvictionStrategy(
    vmName: string,
    namespace: string,
    evictionStrategy: 'LiveMigrate' | 'None',
  ) {
    return this.vm.patchVmEvictionStrategy(vmName, namespace, evictionStrategy);
  }

  async patchVmToErrorState(vmName: string, namespace: string): Promise<void> {
    return this.vm.patchVmToErrorState(vmName, namespace);
  }

  get rbacApi(): k8s.RbacAuthorizationV1Api {
    return this.rbacAuthorizationApi;
  }

  async removeVmDeleteProtection(vmName: string, namespace: string): Promise<boolean> {
    return this.vm.removeVmDeleteProtection(vmName, namespace);
  }

  /**
   * Check if a Service exists in a namespace.
   *
   * @param name - Service name
   * @param namespace - Namespace name
   * @returns True if the Service exists, false otherwise (e.g. 404)
   * @since 1.0.0
   */
  async serviceExists(name: string, namespace: string): Promise<boolean> {
    return this.namespace.serviceExists(name, namespace);
  }

  /**
   * Set the default StorageClass for VirtualMachines (KubeVirt/CNV).
   * Sets the annotation storageclass.kubevirt.io/is-default-virt-class=true on the
   * given StorageClass and false on all others. Equivalent to the console action
   * "Set as default for VirtualMachines".
   *
   * Uses JSON Patch (RFC 6902) because the Kubernetes client-node library sends
   * Content-Type: application/json-patch+json by default for patch operations.
   *
   * @param storageClassName - Name of the StorageClass to set as default for VMs
   * @throws {Error} When listing or patching StorageClasses fails
   * @since 1.0.0
   */
  async setDefaultStorageClassForVirtualMachines(storageClassName: string): Promise<void> {
    return this.clusterSetup.setDefaultStorageClassForVirtualMachines(storageClassName);
  }

  /**
   * Setup OpenShift Console user settings to mark guided tours as completed
   * and set the default namespace for tests.
   *
   * Patches the user-settings-{username} ConfigMap in the openshift-console-user-settings namespace.
   *
   * @param username - The username to configure settings for (default: 'kubeadmin')
   * @param defaultNamespace - The namespace to set as the default/last namespace
   * @returns true if settings were configured, false if ConfigMap doesn't exist or no permissions
   * @since 1.0.0
   */
  async setupConsoleUserSettings(
    username = 'kubeadmin',
    defaultNamespace?: string,
    maxAttempts?: number,
  ): Promise<boolean> {
    return this.clusterSetup.setupConsoleUserSettings(username, defaultNamespace, maxAttempts);
  }

  /**
   * Setup KubeVirt UI configuration.
   * Patches the user settings and UI features configmaps.
   * This replaces OcCliClient.setupKubevirtUiConfig()
   *
   * @param cnvNamespace - The CNV namespace (default: 'openshift-cnv')
   * @param username - The username to configure settings for (default: 'kube-admin')
   * @since 1.0.0
   */
  async setupKubevirtUiConfig(
    cnvNamespace = 'openshift-cnv',
    username = 'kube-admin',
  ): Promise<void> {
    return this.clusterSetup.setupKubevirtUiConfig(cnvNamespace, username);
  }

  async setupTestNamespace(namespace: string, labels?: Record<string, string>): Promise<boolean> {
    return this.namespace.setupTestNamespace(namespace, labels);
  }

  async startVirtualMachine(vmName: string, namespace: string) {
    return this.vm.startVirtualMachine(vmName, namespace);
  }

  async startVm(vmName: string, namespace: string): Promise<boolean> {
    return this.vm.startVm(vmName, namespace);
  }

  async stopVm(vmName: string, namespace: string): Promise<boolean> {
    return this.vm.stopVm(vmName, namespace);
  }

  async uncordonNode(nodeName: string): Promise<void> {
    return this.node.uncordonNode(nodeName);
  }

  /**
   * Verify that we can authenticate to the cluster.
   * This performs a simple API call to check connectivity and authentication.
   *
   * @returns True if authentication is successful
   * @throws {Error} When authentication fails
   * @since 1.0.0
   */
  async verifyAuthentication(): Promise<boolean> {
    return this.clusterSetup.verifyAuthentication();
  }

  async verifyDataVolumeCreated(
    dataVolumeName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<{ dataVolume?: KubernetesResource; error?: string; exists: boolean }> {
    return this.dataVolume.verifyDataVolumeCreated(dataVolumeName, namespace, timeoutMs);
  }

  async verifyFolderDeleted(
    folderName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<{ folderDeleted: boolean; errors?: string[] }> {
    return this.vm.verifyFolderDeleted(folderName, namespace, timeoutMs);
  }

  async verifyHCOSpec(
    jsonPath: string,
    expectedValue: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    return this.hco.verifyHCOSpec(jsonPath, expectedValue, name, namespace);
  }

  async verifyLiveMigrationLimits(
    expectedParallelMigrationsPerCluster: string,
    expectedParallelOutboundMigrationsPerNode: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<{
    parallelMigrationsPerCluster: boolean;
    parallelOutboundMigrationsPerNode: boolean;
    actualParallelMigrationsPerCluster?: string | number;
    actualParallelOutboundMigrationsPerNode?: string | number;
  }> {
    return this.hco.verifyLiveMigrationLimits(
      expectedParallelMigrationsPerCluster,
      expectedParallelOutboundMigrationsPerNode,
      name,
      namespace,
    );
  }

  async verifyMemoryDensity(
    expectedMemoryOvercommitPercentage: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
    maxRetries = 10,
    retryInterval = 2000,
  ): Promise<{
    memoryOvercommitPercentage: boolean;
    actualMemoryOvercommitPercentage?: string | number;
  }> {
    return this.hco.verifyMemoryDensity(
      expectedMemoryOvercommitPercentage,
      name,
      namespace,
      maxRetries,
      retryInterval,
    );
  }

  /**
   * Verify that a MigrationPolicy was created successfully
   * Polls the API until the MigrationPolicy exists or timeout is reached
   *
   * @param policyName - Name of the MigrationPolicy to verify
   * @param timeoutMs - Maximum time to wait for creation (default: 30s)
   * @returns Object with verification result and details
   */
  async verifyMigrationPolicyCreated(
    policyName: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    policy?: KubernetesResource;
  }> {
    return this.namespace.verifyMigrationPolicyCreated(policyName, timeoutMs);
  }

  async verifyNativeVmTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{ error?: string; exists: boolean; template?: KubernetesResource }> {
    return this.template.verifyNativeVmTemplateCreated(templateName, namespace, timeoutMs);
  }

  async verifySecretExists(
    name: string,
    namespace: string,
    timeout: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<boolean> {
    return this.secret.verifySecretExists(name, namespace, timeout);
  }

  async verifySysprepConfigMapExists(
    name: string,
    namespace: string,
    timeout: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<{ exists: boolean; hasAutounattend?: boolean; data?: Record<string, string> }> {
    return this.secret.verifySysprepConfigMapExists(name, namespace, timeout);
  }

  async verifyTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{ error?: string; exists: boolean; template?: KubernetesResource }> {
    return this.template.verifyTemplateCreated(templateName, namespace, timeoutMs);
  }

  async verifyVmCreated(
    vmName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{ error?: string; exists: boolean; vm?: KubernetesResource }> {
    return this.vm.verifyVmCreated(vmName, namespace, timeoutMs);
  }

  async verifyVmFolderAndVmsDeleted(
    vmNames: string[],
    folderName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<{
    folderDeleted: boolean;
    vmsDeleted: { [vmName: string]: boolean };
    allDeleted: boolean;
    errors?: string[];
  }> {
    return this.vm.verifyVmFolderAndVmsDeleted(vmNames, folderName, namespace, timeoutMs);
  }

  async verifyVmHasSSHKey(
    vmName: string,
    namespace: string,
  ): Promise<{ hasSSHKey: boolean; secretName?: string }> {
    return this.vm.verifyVmHasSSHKey(vmName, namespace);
  }

  /**
   * Verifies VM spec JSON contains (or excludes) text .
   */
  async verifyVmSpecContains(
    expectedText: string,
    shouldContain = true,
    vmName: string,
    namespace: string,
  ): Promise<boolean> {
    return this.vm.verifyVmSpecContains(expectedText, shouldContain, vmName, namespace);
  }

  async vmExists(vmName: string, namespace: string): Promise<boolean> {
    return this.vm.vmExists(vmName, namespace);
  }

  /**
   * Wait until the Cluster Observability Operator is installed (subscription has installedCSV).
   * Polls the K8s API until the condition is met or timeout.
   * @param timeoutMs - Max time to wait (default TestTimeouts.OPERATOR_INSTALL, 5 min, under test timeout)
   * @returns true if operator was detected as installed, false on timeout
   */
  async waitForClusterObservabilityOperatorInstalled(
    timeoutMs: number = TestTimeouts.OPERATOR_INSTALL,
  ): Promise<boolean> {
    return this.clusterSetup.waitForClusterObservabilityOperatorInstalled(timeoutMs);
  }

  async waitForDataVolumeSucceeded(
    dataVolumeName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.VM_BOOTUP,
  ): Promise<void> {
    return this.dataVolume.waitForDataVolumeSucceeded(dataVolumeName, namespace, timeoutMs);
  }

  async waitForNamespaceReady(name: string, timeout = 30000): Promise<boolean> {
    return this.namespace.waitForNamespaceReady(name, timeout);
  }

  /**
   * Example: Wait for a pod to be ready
   */
  async waitForPodReady(namespace: string, podName: string, timeoutMs = 60000): Promise<boolean> {
    return this.namespace.waitForPodReady(namespace, podName, timeoutMs);
  }

  async waitForRestoreDeleted(
    restoreName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    return this.snapshot.waitForRestoreDeleted(restoreName, namespace, timeoutMs);
  }

  /**
   * Poll until a Service exists or timeout (VMI subdomain services can appear after the VM is Running).
   */
  async waitForServiceExists(
    name: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.VM_BOOTUP,
    pollIntervalMs: number = TestTimeouts.POLLING_INTERVAL,
  ): Promise<boolean> {
    return this.namespace.waitForServiceExists(name, namespace, timeoutMs, pollIntervalMs);
  }

  async waitForSnapshotDeleted(
    snapshotName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    return this.snapshot.waitForSnapshotDeleted(snapshotName, namespace, timeoutMs);
  }

  async waitForSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    return this.snapshot.waitForSnapshotReady(snapshotName, namespace, timeoutMs);
  }

  async waitForTestUserInNamespace(
    namespace: string,
    username: string,
    timeoutMs = 15 * 1000,
  ): Promise<void> {
    return this.namespace.waitForTestUserInNamespace(namespace, username, timeoutMs);
  }

  async waitForVmCloneSucceeded(cloneName: string, namespace: string, timeoutMs = 120000) {
    return this.vm.waitForVmCloneSucceeded(cloneName, namespace, timeoutMs);
  }

  async waitForVmDeleted(vmName: string, namespace: string, timeoutMs = 60000): Promise<boolean> {
    return this.vm.waitForVmDeleted(vmName, namespace, timeoutMs);
  }

  async waitForVmDiskPresent(
    vmName: string,
    namespace: string,
    diskName: string,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ): Promise<void> {
    return this.vm.waitForVmDiskPresent(vmName, namespace, diskName, timeoutMs);
  }

  async waitForVmError(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    return this.vm.waitForVmError(vmName, namespace, timeoutMs);
  }

  async waitForVmExists(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    return this.vm.waitForVmExists(vmName, namespace, timeoutMs);
  }

  async waitForVmRunning(vmName: string, namespace: string, timeoutMs = 300000): Promise<boolean> {
    return this.vm.waitForVmRunning(vmName, namespace, timeoutMs);
  }

  async waitForVolumeSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.RESOURCE_CREATION,
  ): Promise<void> {
    return this.snapshot.waitForVolumeSnapshotReady(snapshotName, namespace, timeoutMs);
  }

  /**
   * Retry an operation with exponential backoff for transient network/TLS failures.
   * Handles common connection issues like socket disconnects and TLS handshake failures.
   *
   * @param operation - The async operation to retry
   * @param operationName - Name for logging purposes
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param initialDelayMs - Initial delay in milliseconds (default: 1000)
   * @returns The result of the operation
   * @throws The last error if all retries fail
   */
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
        logger.warn(
          `⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms: ${errorMessage}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
