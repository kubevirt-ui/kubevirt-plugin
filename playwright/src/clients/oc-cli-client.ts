import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { dump, loadAll } from 'js-yaml';

import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { logger } from '@/utils/logger';
import type { Page } from '@playwright/test';

import type { ClusterAuthConfig } from './base-client';
import BaseClient from './base-client';

const execAsync = promisify(exec);

/**
 * OpenShift CLI client for executing oc commands and managing cluster resources.
 *
 * This client provides a comprehensive interface for interacting with OpenShift/Kubernetes
 * clusters using the oc command-line tool. It handles authentication, resource management,
 * cleanup operations, and various cluster administration tasks.
 *
 * Key features:
 * - Automatic authentication with username/password or token
 * - Resource creation, deletion, and management
 * - Comprehensive cleanup operations for test environments
 * - Namespace and project management
 * - Pod execution and log retrieval
 * - Configuration patching and setup
 * - Support for both namespaced and cluster-scoped resources
 *
 * The client supports multiple authentication methods:
 * - Username/password authentication
 * - Token-based authentication
 * - Kubeconfig file usage
 *
 * @example
 * ```typescript
 * const config: ClusterAuthConfig = {
 *   baseUrl: 'https://api.example.com:6443',
 *   username: 'admin',
 *   password: 'password123'
 * };
 * const ocClient = new OcCliClient(page, config);
 *
 * // Initialize and create resources
 * await ocClient.initialize();
 * await ocClient.createProject('test-namespace');
 * await ocClient.applyResource('vm.yaml', 'test-namespace');
 * ```
 *
 * @extends BaseClient
 * @since 1.0.0
 */
export default class OcCliClient extends BaseClient {
  /** Flag indicating whether the client is logged into the cluster */
  private isLoggedIn = false;

  /** Optional path to kubeconfig file for authentication */
  private kubeConfigPath?: string;

  /** Path to the oc command-line tool */
  private ocPath: string;

  /**
   * Creates a new OcCliClient instance.
   *
   * @param page - Optional Playwright page instance for UI-based operations
   * @param config - Cluster authentication configuration
   * @param config.baseUrl - The base URL of the cluster API server
   * @param config.password - The password for authentication
   * @param config.username - The username for authentication
   * @param ocPath - Path to the oc command-line tool (default: 'oc')
   * @param kubeConfigPath - Optional path to kubeconfig file for authentication
   *
   * @since 1.0.0
   */
  constructor(
    page: Page | undefined,
    config: ClusterAuthConfig,
    ocPath = 'oc',
    kubeConfigPath?: string,
  ) {
    super(page, config);
    this.ocPath = ocPath;
    this.kubeConfigPath = kubeConfigPath;
  }

  /**
   * Executes an oc command and returns the result.
   *
   * This is the core method that handles all oc command execution. It handles
   * command construction and error handling. Authentication is handled by using
   * the kubeconfig file if it exists (created during login).
   *
   * Note: Login should only happen when explicitly calling login methods.
   * This method does not automatically trigger login - it relies on the kubeconfig
   * file that was created during the original login.
   *
   * @param args - Array of command arguments (e.g., ['get', 'pods', '-n', 'default'])
   * @param options - Optional execution options
   * @param options.ignoreError - Whether to ignore command errors and return empty string
   * @param options.skipAuth - Whether to skip authentication check (deprecated, kept for compatibility)
   * @returns The command output as a string
   * @throws {Error} When command execution fails (unless ignoreError is true)
   * @private
   * @since 1.0.0
   */
  private async executeOc(
    args: string[],
    options?: { ignoreError?: boolean; skipAuth?: boolean },
  ): Promise<string> {
    // Use kubeconfig file if it exists (created during login)
    // Login should only happen when explicitly calling login methods, not automatically
    const kubeConfigFlag = this.kubeConfigPath ? `--kubeconfig=${this.kubeConfigPath}` : '';
    const command = `${this.ocPath} ${kubeConfigFlag} ${args.join(' ')}`.trim();

    try {
      const { stderr: _stderr, stdout } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      return stdout.trim();
    } catch (error: unknown) {
      if (options?.ignoreError) {
        const stdout =
          typeof error === 'object' && error !== null && 'stdout' in error
            ? String((error as { stdout?: unknown }).stdout ?? '')
            : '';
        return stdout;
      }
      const stderr =
        typeof error === 'object' && error !== null && 'stderr' in error
          ? String((error as { stderr?: unknown }).stderr ?? '')
          : '';
      const sanitized = command
        .replace(/--(?:password|token)=\S+/g, '--$1=***')
        .replace(/-p\s+\S+/g, '-p ***');
      throw new Error(
        `OC command failed: ${sanitized}\nError: ${getErrorMessage(error)}\nStderr: ${stderr}`,
      );
    }
  }

  /**
   * Execute an oc command and parse JSON output
   */
  private async executeOcJson<T = KubernetesResource>(args: string[]): Promise<T> {
    const output = await this.executeOc([...args, '-o', 'json']);
    try {
      return JSON.parse(output);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse JSON output from oc command: ${msg}`);
    }
  }

  /**
   * Login to the cluster using username and password
   * If kubeConfigPath is set, the login will use that specific kubeconfig file
   */
  private async loginWithCredentials(): Promise<void> {
    try {
      const args = [
        'login',
        this.baseUrl,
        `--username=${this.username}`,
        `--password=${this.password}`,
        '--insecure-skip-tls-verify=true',
      ];

      await this.executeOc(args);
      this.isLoggedIn = true;
    } catch (error: unknown) {
      throw new Error(`Failed to login to cluster: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Apply manifest(s) from a local path. Does not pass `-n` — use for cluster-scoped
   * resources or for YAML that already sets metadata.namespace on each document.
   */
  async applyManifestFromPath(yamlPath: string): Promise<string> {
    return await this.executeOc(['apply', '-f', yamlPath]);
  }

  /**
   * Load YAML (multi-doc supported), set metadata.namespace on namespaced kinds, then apply.
   * Cluster-scoped kinds (NodeNetworkConfigurationPolicy, etc.) are left without a namespace.
   */
  async applyNamespacedManifestFromFile(absolutePath: string, namespace: string): Promise<string> {
    const clusterScopedKinds = new Set([
      'Namespace',
      'ClusterRole',
      'ClusterRoleBinding',
      'NodeNetworkConfigurationPolicy',
      'MachineConfig',
      'StorageClass',
      'PersistentVolume',
    ]);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const docs = loadAll(raw) as Array<{ kind?: string; metadata?: { namespace?: string } }>;
    for (const doc of docs) {
      if (!doc?.kind || clusterScopedKinds.has(doc.kind)) {
        continue;
      }
      if (!doc.metadata) {
        doc.metadata = {};
      }
      doc.metadata.namespace = namespace;
    }
    const out = docs.map((d) => dump(d, { lineWidth: -1 })).join('---\n');
    const tmp = path.join(
      os.tmpdir(),
      `pw-apply-${path.basename(absolutePath)}-${Date.now()}.yaml`,
    );
    fs.writeFileSync(tmp, out, 'utf8');
    try {
      return await this.executeOc(['apply', '-f', tmp]);
    } finally {
      fs.unlinkSync(tmp);
    }
  }

  /**
   * Apply a resource from a file
   */
  async applyResource(yamlPath: string, namespace: string): Promise<string> {
    const args = ['apply', '-f', yamlPath, '-n', namespace];
    return await this.executeOc(args);
  }

  /**
   * Cleanup cluster-wide test resources
   */
  async cleanupClusterResources(): Promise<void> {
    await this.deleteResourcesByLabel(
      'template',
      { 'app.kubernetes.io/name': 'custom-templates' },
      'openshift',
      { wait: false },
    );

    await this.deleteResource('VirtualMachineClusterInstancetype', 'example', undefined, {
      ignoreNotFound: true,
      wait: false,
    });

    await this.deleteResource('VirtualMachineClusterPreference', 'example', undefined, {
      ignoreNotFound: true,
      wait: false,
    });

    await this.deleteResource('MigrationPolicy', 'example', undefined, {
      ignoreNotFound: true,
      wait: false,
    });
  }

  /**
   * Cleanup CNV namespace resources
   */
  async cleanupCnvNamespace(): Promise<void> {
    await this.deleteResourcesByLabelSelector(
      'pvc',
      'k8s-app!=hostpath-provisioner',
      'openshift-cnv',
      { wait: false },
    );
  }

  /**
   * Cleanup openshift namespace resources
   */
  async cleanupOpenshiftNamespace(): Promise<void> {
    await this.deleteAllResources('pvc', 'openshift', { wait: false });
  }

  /**
   * Cleanup test namespace resources
   * Deletes VMs, VMIs, templates, snapshots, volumes, PVCs, secrets, network attachments, and VMIMs
   * All deletions run in parallel for faster cleanup
   * Uses force deletion for VMs to handle stuck VMs with finalizers
   */
  async cleanupTestNamespace(namespace: string): Promise<void> {
    // VirtualMachineInstances need to be deleted before or with VMs
    await Promise.allSettled([
      this.deleteAllResources('vmi', namespace, { ignoreNotFound: true, wait: false }).catch(() => {
        return;
      }),
      // Delete VMs with force to handle stuck VMs with finalizers (ErrorUnschedulable state)
      this.deleteAllResourcesWithForce('vm', namespace, { ignoreNotFound: true, wait: true }).catch(
        () => {
          return;
        },
      ),
    ]);

    await Promise.allSettled([
      this.deleteAllResources('template', namespace, { ignoreNotFound: true, wait: false }).catch(
        () => {
          return;
        },
      ),
      this.deleteAllResources('VirtualMachineSnapshot', namespace, { ignoreNotFound: true }).catch(
        () => {
          return;
        },
      ),
      // this.deleteAllResources('datavolume', namespace, { ignoreNotFound: true, wait: false }).catch(() => { }),
      // this.deleteAllResources('datasource', namespace, { ignoreNotFound: true, wait: false }).catch(() => { }),
      // this.deleteAllResources('pvc', namespace, { ignoreNotFound: true, wait: false }).catch(() => { }),
      this.deleteAllResources('secret', namespace, { ignoreNotFound: true, wait: false }).catch(
        () => {
          return;
        },
      ),
      this.deleteAllResources('net-attach-def', namespace, {
        ignoreNotFound: true,
        wait: false,
      }).catch(() => {
        return;
      }),
      // Delete ALL instance types, not just 'example'
      this.deleteAllResources('VirtualMachineInstancetype', namespace, {
        ignoreNotFound: true,
        wait: false,
      }).catch(() => {
        return;
      }),
      // Delete ALL preferences, not just 'example'
      this.deleteAllResources('VirtualMachinePreference', namespace, {
        ignoreNotFound: true,
        wait: false,
      }).catch(() => {
        return;
      }),
      this.deleteAllResources('migplan', namespace, { ignoreNotFound: true, wait: false }).catch(
        () => {
          return;
        },
      ),
      this.deleteAllResources('vmim', namespace, { ignoreNotFound: true, wait: false }).catch(
        () => {
          return;
        },
      ),
      this.deleteSysprepConfigMaps(namespace).catch(() => {
        return;
      }),
    ]);
  }

  /**
   * Cleanup virtualization OS images resources
   */
  async cleanupVirtualizationOsImages(): Promise<void> {
    const namespace = 'openshift-virtualization-os-images';

    await this.deleteResourcesByLabelSelector(
      'datasource',
      'app.kubernetes.io/part-of!=hyperconverged-cluster',
      namespace,
    );

    await this.deleteResourcesByLabelSelector(
      'datavolume',
      'app.kubernetes.io/part-of!=hyperconverged-cluster',
      namespace,
    );

    await this.deleteAllResources('pvc', namespace, { wait: false });
  }

  /**
   * Cordon a node (mark as unschedulable). Equivalent to `oc adm cordon <nodeName>`.
   */
  async cordonNode(nodeName: string): Promise<void> {
    await this.executeOc(['adm', 'cordon', nodeName]);
  }

  /**
   * Create a new project (namespace)
   */
  async createProject(name: string): Promise<string> {
    return await this.executeOc(['new-project', name]);
  }

  /**
   * Create a resource from a file or stdin
   */
  async createResource(yamlPath: string, namespace: string): Promise<string> {
    const args = ['create', '-f', yamlPath, '-n', namespace];
    return await this.executeOc(args);
  }

  /**
   * Create a resource from YAML content
   */
  async createResourceFromYaml(yamlContent: string, namespace: string): Promise<string> {
    const args = ['create', '-f', '-', '-n', namespace];

    // For stdin input, we need a different approach
    return new Promise((resolve, reject) => {
      const kubeConfigFlag = this.kubeConfigPath ? `--kubeconfig=${this.kubeConfigPath}` : '';
      const command = `${this.ocPath} ${kubeConfigFlag} ${args.join(' ')}`.trim();

      const child = exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to create resource: ${error.message}\n${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });

      child.stdin?.write(yamlContent);
      child.stdin?.end();
    });
  }

  /**
   * Create a secret from YAML file
   */
  async createSecretFromFile(yamlPath: string, namespace: string): Promise<string> {
    const args = ['create', '-f', yamlPath, '-n', namespace];
    return await this.executeOc(args);
  }

  /**
   * Delete all resources of a kind in a namespace
   */
  async deleteAllResources(
    kind: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', kind, '--all', '-n', namespace];
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete all resources of a specific kind with force deletion
   * Used for VMs that may have finalizers preventing normal deletion
   */
  async deleteAllResourcesWithForce(
    kind: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', kind, '--all', '-n', namespace, '--force', '--grace-period=0'];
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete a project (namespace)
   */
  async deleteProject(
    name: string,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', 'project', name];
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete a resource
   * For cluster-scoped resources, pass undefined as namespace
   */
  async deleteResource(
    kind: string,
    name: string,
    namespace: string | undefined,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', kind, name];
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete resources by label selector
   * For cluster-scoped resources, pass undefined as namespace
   */
  async deleteResourcesByLabel(
    kind: string,
    labels: Record<string, string>,
    namespace: string | undefined,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', kind];
    const labelSelector = Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    args.push('-l', labelSelector);
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete resources by label selector with advanced options (supports negation)
   */
  async deleteResourcesByLabelSelector(
    kind: string,
    labelSelector: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean; wait?: boolean },
  ): Promise<string> {
    const args = ['delete', kind, '-l', labelSelector, '-n', namespace];
    if (options?.ignoreNotFound) {
      args.push('--ignore-not-found');
    }
    if (options?.wait !== undefined) {
      args.push(`--wait=${options.wait}`);
    }
    return await this.executeOc(args);
  }

  /**
   * Delete sysprep ConfigMaps created for Windows VM tests
   * These are ConfigMaps with names starting with 'sysprep-'
   */
  async deleteSysprepConfigMaps(namespace: string): Promise<void> {
    try {
      const output = await this.executeOc([
        'get',
        'configmap',
        '-n',
        namespace,
        '-o',
        'jsonpath={.items[*].metadata.name}',
      ]);

      if (!output || output.trim() === '') {
        return;
      }

      const configMapNames = output.trim().split(/\s+/);
      const sysprepConfigMaps = configMapNames.filter((name) => name.startsWith('sysprep-'));

      if (sysprepConfigMaps.length === 0) {
        return;
      }

      await Promise.allSettled(
        sysprepConfigMaps.map((name) =>
          this.executeOc([
            'delete',
            'configmap',
            name,
            '-n',
            namespace,
            '--ignore-not-found',
          ]).catch(() => {
            return;
          }),
        ),
      );
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Delete volumesnapshots by label selector and wait for deletion to complete
   * @param namespace - Namespace where volumesnapshots exist
   * @param labels - Label selector (e.g., { 'cdi.kubevirt.io/dataImportCron': 'centos-stream9-image-cron' })
   * @param timeoutMs - Maximum time to wait for deletion (default: 30000ms)
   * @returns True if volumesnapshots were deleted successfully
   */
  async deleteVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    timeoutMs = 30000,
  ): Promise<boolean> {
    await this.deleteResourcesByLabel('volumesnapshot', labels, namespace, {
      ignoreNotFound: true,
      wait: false,
    });

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const resources = await this.getResources('volumesnapshot', namespace, labels);
        const items = resources?.items || [];
        if (items.length === 0) {
          return true; // All resources deleted
        }
      } catch (error: unknown) {
        // If getResources fails (e.g., resource not found), deletion is complete
        const msg = getErrorMessage(error);
        if (msg.includes('not found') || msg.includes('NotFound')) {
          return true;
        }
        // For other errors, continue waiting
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    try {
      const resources = await this.getResources('volumesnapshot', namespace, labels);
      const items = resources?.items || [];
      return items.length === 0;
    } catch {
      return true; // Assume deleted if we can't check
    }
  }

  /**
   * Ensure namespace exists (get or create)
   */
  async ensureNamespace(namespace: string): Promise<string> {
    const exists = await this.namespaceExists(namespace);
    if (exists) {
      return await this.executeOc(['get', 'namespace', namespace, '-o', 'json']);
    } else {
      return await this.createProject(namespace);
    }
  }

  /**
   * Ensure secret exists (get or create from file)
   */
  async ensureSecret(name: string, namespace: string, yamlPath: string): Promise<string> {
    const exists = await this.secretExists(name, namespace);
    if (exists) {
      return await this.executeOc(['get', 'secret', name, '-n', namespace, '-o', 'json']);
    } else {
      return await this.createSecretFromFile(yamlPath, namespace);
    }
  }

  /**
   * Execute a command in a pod
   */
  async execInPod(
    podName: string,
    command: string[],
    namespace: string,
    options?: { container?: string },
  ): Promise<string> {
    const args = ['exec', podName, '-n', namespace];
    if (options?.container) {
      args.push('-c', options.container);
    }
    args.push('--', ...command);
    return await this.executeOc(args);
  }

  /**
   * Execute complete cleanup (all test resources)
   * Always keeps the namespace - only cleans up resources within it
   */
  async executeCompleteCleanup(testNamespace: string): Promise<void> {
    await this.cleanupTestNamespace(testNamespace);

    // Always keep the namespace - don't delete it
    logger.info(`ℹ️  Keeping namespace ${testNamespace} (namespace persistence enabled)`);
  }

  /**
   * Execute complete test setup
   * Creates namespace, configures UI, and creates secrets
   */
  async executeCompleteSetup(config: {
    cnvNamespace: string;
    secretName: string;
    testNamespace: string;
  }): Promise<void> {
    await this.setupTestNamespace(config.testNamespace);

    await this.setupKubevirtUiConfig(config.cnvNamespace);

    // await this.setupTestSecret(config.secretName, config.testNamespace);
  }

  /**
   * Execute a raw oc command (for advanced use cases)
   * Note: The command should not include 'oc' prefix as it's added automatically
   * Supports shell commands with pipes (e.g., 'get pods | grep name')
   */
  async executeRawCommand(command: string): Promise<string> {
    const trimmedCommand = command.trim();

    // Remove 'oc' prefix if present (executeOc already adds it)
    const commandWithoutOc = trimmedCommand.startsWith('oc ')
      ? trimmedCommand.substring(3).trim()
      : trimmedCommand;

    // If command contains pipes or other shell operators, execute as shell command
    if (
      commandWithoutOc.includes('|') ||
      commandWithoutOc.includes('&&') ||
      commandWithoutOc.includes('||')
    ) {
      const kubeConfigFlag = this.kubeConfigPath ? `--kubeconfig=${this.kubeConfigPath}` : '';
      const fullCommand = `${this.ocPath} ${kubeConfigFlag} ${commandWithoutOc}`.trim();

      try {
        const { stderr: _stderr, stdout } = await execAsync(fullCommand, {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          shell: '/bin/bash', // Use bash to support pipes
        });

        return stdout.trim();
      } catch (error: unknown) {
        // For grep commands, no match is not necessarily an error
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? (error as { code?: unknown }).code
            : undefined;
        if (commandWithoutOc.includes('grep') && code === 1) {
          return ''; // Return empty string for grep with no matches
        }
        const stderr =
          typeof error === 'object' && error !== null && 'stderr' in error
            ? String((error as { stderr?: unknown }).stderr ?? '')
            : '';
        throw new Error(
          `OC command failed: ${fullCommand}\nError: ${getErrorMessage(error)}\nStderr: ${stderr}`,
        );
      }
    }

    const args = commandWithoutOc.split(' ');
    return await this.executeOc(args);
  }

  /**
   * Log in as an arbitrary user and return their OAuth Bearer token.
   *
   * Uses `oc login --server=<clusterUrl> -u <username> -p <password>` in a
   * throw-away temp kubeconfig so the main kubeconfig is never mutated, then
   * extracts the token with `oc whoami --show-token`.
   *
   * The temp kubeconfig is deleted after the token is extracted.
   *
   * @param username - OpenShift username
   * @param password - OpenShift password
   * @returns Bearer token (trimmed, no newlines)
   */
  async fetchTokenForUser(username: string, password: string): Promise<string> {
    const tmpKubeconfig = path.join(os.tmpdir(), `oc-kubeconfig-${username}-${Date.now()}`);
    try {
      const loginArgs = [
        'login',
        this.baseUrl,
        '-u',
        username,
        '-p',
        password,
        '--insecure-skip-tls-verify=true',
        '--kubeconfig',
        tmpKubeconfig,
      ];
      await this.executeOc(loginArgs);
      const token = await this.executeOc(['whoami', '--show-token', '--kubeconfig', tmpKubeconfig]);
      return token.trim();
    } finally {
      try {
        fs.unlinkSync(tmpKubeconfig);
      } catch {
        // best-effort cleanup
      }
    }
  }

  /**
   * Get cluster version
   */
  async getClusterVersion(): Promise<KubernetesResource> {
    return await this.executeOcJson<KubernetesResource>(['get', 'clusterversion', 'version']);
  }

  /**
   * Get the current project
   */
  async getCurrentProject(): Promise<string> {
    return await this.executeOc(['project', '-q']);
  }

  /**
   * Get current user token
   * @param kubeConfigPath - Optional path to kubeconfig file to use
   */
  async getCurrentUserToken(kubeConfigPath?: string): Promise<string> {
    const args = ['whoami', '--show-token'];
    if (kubeConfigPath) {
      args.push('--kubeconfig', kubeConfigPath);
    }
    return await this.executeOc(args);
  }

  /**
   * Get KubeVirt console plugin version
   */
  async getKubevirtPluginVersion(): Promise<string | undefined> {
    try {
      const version = await this.executeOc([
        'get',
        'consoleplugin',
        'kubevirt-plugin',
        '-o',
        'jsonpath="{.metadata.labels.app\\.kubernetes\\.io/version}"',
      ]);
      // Remove quotes if present
      return version.replace(/^"|"$/g, '').trim() || undefined;
    } catch (error) {
      // Console plugin might not exist or not be accessible
      return undefined;
    }
  }

  /**
   * Get logs from a pod
   */
  async getLogs(
    podName: string,
    namespace: string,
    options?: { container?: string; previous?: boolean; tail?: number },
  ): Promise<string> {
    const args = ['logs', podName, '-n', namespace];
    if (options?.container) {
      args.push('-c', options.container);
    }
    if (options?.previous) {
      args.push('--previous');
    }
    if (options?.tail) {
      args.push('--tail', options.tail.toString());
    }
    return await this.executeOc(args);
  }

  /**
   * Get the operating system (osImage) of the first cluster node.
   * Used for Allure environment reporting (e.g. RHCOS version).
   */
  async getNodeOsImage(): Promise<string | undefined> {
    try {
      interface NodesList {
        items?: Array<{ status?: { nodeInfo?: { osImage?: string } } }>;
      }
      const nodes = await this.executeOcJson<NodesList>(['get', 'nodes']);
      const firstNode = nodes?.items?.[0];
      const osImage = firstNode?.status?.nodeInfo?.osImage;
      return osImage?.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  async getResource(
    kind: string,
    name: string,
    namespace: string | undefined,
  ): Promise<KubernetesResource> {
    const args = ['get', kind, name];
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    return await this.executeOcJson<KubernetesResource>(args);
  }

  /**
   * Get multiple resources
   * For cluster-scoped resources, pass undefined as namespace
   */
  async getResources(
    kind: string,
    namespace: string | undefined,
    labels?: Record<string, string>,
  ): Promise<KubernetesListResource<KubernetesResource>> {
    const args = ['get', kind];
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    if (labels) {
      const labelSelector = Object.entries(labels)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
      args.push('-l', labelSelector);
    }
    return await this.executeOcJson<KubernetesListResource<KubernetesResource>>(args);
  }

  /**
   * Get VMI CPU sockets count.
   * Matches Cypress: cy.exec(`oc get vmi ${vmName} -o jsonpath='{.spec.domain.cpu.sockets}'`)
   */
  async getVmiCpuSockets(vmName: string, namespace: string): Promise<string | null> {
    try {
      const result = await this.executeOc([
        'get',
        'vmi',
        vmName,
        '-n',
        namespace,
        '-o',
        "jsonpath='{.spec.domain.cpu.sockets}'",
      ]);
      return result.trim().replace(/'/g, '');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get VMI memory guest value.
   * Matches Cypress: cy.exec(`oc get vmi ${vmName} -o jsonpath='{.spec.domain.memory.guest}'`)
   */
  async getVmiMemoryGuest(vmName: string, namespace: string): Promise<string | null> {
    try {
      const result = await this.executeOc([
        'get',
        'vmi',
        vmName,
        '-n',
        namespace,
        '-o',
        "jsonpath='{.spec.domain.memory.guest}'",
      ]);
      return result.trim().replace(/'/g, '');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get volumesnapshots by label selector and wait for them to exist
   * @param namespace - Namespace where volumesnapshots should exist
   * @param labels - Label selector (e.g., { 'cdi.kubevirt.io/dataImportCron': 'centos-stream9-image-cron' })
   * @param namePattern - Optional pattern to match in resource names (e.g., 'centos-stream9')
   * @param timeoutMs - Maximum time to wait for resources (default: 60000ms)
   * @returns Array of matching volumesnapshot resources
   */
  async getVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    namePattern?: string,
    timeoutMs = 60000,
  ): Promise<KubernetesResource[]> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const resources = await this.getResources('volumesnapshot', namespace, labels);
        const items = resources?.items || [];

        if (items.length > 0) {
          // If namePattern is provided, filter by name
          if (namePattern) {
            const matching = items.filter((item) => item.metadata?.name?.includes(namePattern));
            if (matching.length > 0) {
              return matching;
            }
          } else {
            return items;
          }
        }
      } catch (error: unknown) {
        // If resources don't exist yet, continue waiting
        const msg = getErrorMessage(error);
        if (!msg.includes('not found') && !msg.includes('NotFound')) {
          throw error; // Re-throw unexpected errors
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(
      `Timeout waiting for volumesnapshots with labels ${JSON.stringify(
        labels,
      )} in namespace ${namespace}`,
    );
  }

  /**
   * Initializes the client by logging into the cluster.
   *
   * This method should be called before using other methods to ensure proper
   * authentication. It automatically handles login if not already authenticated
   * and no kubeconfig file is provided.
   *
   * @since 1.0.0
   */
  async initialize(): Promise<void> {
    if (!this.isLoggedIn && !this.kubeConfigPath) {
      await this.loginWithCredentials();
    }
  }

  /**
   * Check if oc CLI is available
   */
  async isOcAvailable(): Promise<boolean> {
    try {
      await this.executeOc(['version', '--client'], { ignoreError: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login and create a kubeconfig file at the specified path
   * This is useful for creating persistent kubeconfig files that can be reused
   * @param kubeConfigPath - Path where the kubeconfig file should be created
   */
  async loginAndCreateKubeConfig(kubeConfigPath: string): Promise<void> {
    // Temporarily clear kubeConfigPath so executeOc doesn't add --kubeconfig at the beginning
    const previousKubeConfigPath = this.kubeConfigPath;
    try {
      this.kubeConfigPath = undefined;

      // Use executeOc with skipAuth to avoid login check loop
      // Add --kubeconfig flag at the end of the command
      const args = [
        'login',
        this.baseUrl,
        `--username=${this.username}`,
        `--password=${this.password}`,
        '--insecure-skip-tls-verify=true',
        `--kubeconfig=${kubeConfigPath}`,
      ];

      await this.executeOc(args, { skipAuth: true });

      // Set kubeconfig path after successful login
      this.kubeConfigPath = kubeConfigPath;
      this.isLoggedIn = true;

      return;
    } catch (error: unknown) {
      // Restore previous kubeConfigPath on error
      this.kubeConfigPath = previousKubeConfigPath;
      throw new Error(`Failed to login and create kubeconfig: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Login to OpenShift cluster using token
   */
  async loginWithToken(
    token: string,
    options?: { insecureSkipTlsVerify?: boolean },
  ): Promise<void> {
    const args = ['login', this.baseUrl, `--token=${token}`];
    if (options?.insecureSkipTlsVerify) {
      args.push('--insecure-skip-tls-verify');
    }
    await this.executeOc(args, { skipAuth: true });
    this.isLoggedIn = true;
  }

  /**
   * Check if a namespace exists
   */
  async namespaceExists(namespace: string): Promise<boolean> {
    try {
      await this.executeOc(['get', 'namespace', namespace]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Patch a resource with merge strategy
   * Note: The patch parameter should be a JSON string. It will be properly escaped for shell execution.
   * For cluster-scoped resources, pass undefined as namespace
   */
  async patchResource(
    kind: string,
    name: string,
    patch: string,
    namespace: string | undefined,
    patchType = 'merge',
  ): Promise<string> {
    // Escape the patch JSON for shell execution
    // Single quotes prevent shell interpretation, but we need to escape any single quotes in the patch
    const escapedPatch = patch.replace(/'/g, "'\\''");
    const args = ['patch', kind, name, `--type=${patchType}`, '--patch', `'${escapedPatch}'`];
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    return await this.executeOc(args);
  }

  /**
   * Check if a secret exists
   */
  async secretExists(name: string, namespace: string): Promise<boolean> {
    try {
      await this.executeOc(['get', 'secret', name, '-n', namespace]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Setup KubeVirt UI configuration
   * Patches user settings and UI features configmaps
   *
   * @param cnvNamespace - The CNV namespace
   * @param username - The username to configure settings for (default: 'kube-admin')
   */
  async setupKubevirtUiConfig(cnvNamespace: string, username = 'kube-admin'): Promise<void> {
    const userSettingsPatch = `{"data": {"${username}": "{\\"quickStart\\":{\\"dontShowWelcomeModal\\":true}}"}}`;
    await this.patchResource(
      'configmap',
      'kubevirt-user-settings',
      userSettingsPatch,
      cnvNamespace,
      'merge',
    );

    const uiFeaturesPatch = '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}';
    await this.patchResource(
      'configmap',
      'kubevirt-ui-features',
      uiFeaturesPatch,
      cnvNamespace,
      'merge',
    );
  }

  /**
   * Setup test namespace
   * Creates namespace if it doesn't exist
   */
  async setupTestNamespace(namespace: string): Promise<void> {
    const exists = await this.namespaceExists(namespace);
    if (exists) {
      logger.info(`✓ Namespace '${namespace}' already exists, reusing it`);
    } else {
      logger.info(`📦 Creating namespace '${namespace}'...`);
    }
    await this.ensureNamespace(namespace);
    if (!exists) {
      logger.success(`✓ Namespace '${namespace}' created successfully`);
    }
  }

  /**
   * Setup test secret
   * Creates secret if it doesn't exist
   */
  async setupTestSecret(secretName: string, namespace: string, yamlPath: string): Promise<void> {
    await this.ensureSecret(secretName, namespace, yamlPath);
  }

  /**
   * Switch to a different project/namespace
   */
  async switchProject(namespace: string): Promise<void> {
    await this.executeOc(['project', namespace]);
  }

  /**
   * Uncordon a node (mark as schedulable again). Equivalent to `oc adm uncordon <nodeName>`.
   */
  async uncordonNode(nodeName: string): Promise<void> {
    await this.executeOc(['adm', 'uncordon', nodeName]);
  }

  /**
   * Verifies that a resource exists in the cluster.
   * Matches Cypress: cy.exec('oc get service headless');
   *
   * @param kind - The resource kind (e.g., 'service', 'vm', 'vmi')
   * @param name - The resource name
   * @param namespace - The namespace (optional for cluster-scoped resources)
   * @returns True if the resource exists
   */
  async verifyResourceExists(kind: string, name: string, namespace?: string): Promise<boolean> {
    try {
      const args = ['get', kind, name];
      if (namespace) {
        args.push('-n', namespace);
      }
      await this.executeOc(args, { ignoreError: false });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for a resource condition
   * For cluster-scoped resources, pass undefined as namespace
   */
  async waitForCondition(
    kind: string,
    name: string,
    condition: string,
    namespace: string | undefined,
    timeoutSeconds = 60,
  ): Promise<void> {
    const args = ['wait', kind, name, `--for=${condition}`, `--timeout=${timeoutSeconds}s`];
    if (namespace !== undefined) {
      args.push('-n', namespace);
    }
    await this.executeOc(args);
  }
}
