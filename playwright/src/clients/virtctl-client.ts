import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { getErrorMessage } from '@/data-models/kubernetes-types';
import type { Page } from '@playwright/test';

import type { ClusterAuthConfig } from './base-client';
import BaseClient from './base-client';

const VIRTCTL_TIMEOUT_MS = 120_000;
const SSH_KEYGEN_TIMEOUT_MS = 30_000;
const execFileAsync = promisify(execFile);

/**
 * Virtctl CLI client for executing virtctl commands and managing KubeVirt resources.
 *
 * This client provides a comprehensive interface for interacting with KubeVirt
 * VirtualMachines and VirtualMachineInstances using the virtctl command-line tool.
 * It handles authentication via kubeconfig and provides methods for common virtctl
 * operations like VM migration, console access, and other lifecycle management tasks.
 *
 * Key features:
 * - Kubeconfig-based authentication
 * - VirtualMachine migration operations
 * - Support for common virtctl commands
 * - Error handling and command execution
 *
 * The client assumes virtctl binary is available in the PATH or can be specified
 * via the virtctlPath constructor parameter.
 *
 * @example
 * ```typescript
 * const config: ClusterAuthConfig = {
 *   baseUrl: 'https://api.example.com:6443',
 *   username: 'admin',
 *   password: 'password123'
 * };
 * const virtctlClient = new VirtctlClient(page, config);
 *
 * // Migrate a VM
 * await virtctlClient.migrateVm('test-vm', 'default');
 * ```
 *
 * @extends BaseClient
 * @since 1.0.0
 */
export default class VirtctlClient extends BaseClient {
  /** Optional path to kubeconfig file for authentication */
  private kubeConfigPath?: string;

  /** Path to the virtctl command-line tool */
  private virtctlPath: string;

  /**
   * Creates a new VirtctlClient instance.
   *
   * @param page - Optional Playwright page instance for UI-based operations
   * @param config - Cluster authentication configuration
   * @param config.baseUrl - The base URL of the cluster API server
   * @param config.password - The password for authentication
   * @param config.username - The username for authentication
   * @param virtctlPath - Path to the virtctl command-line tool (default: 'virtctl')
   * @param kubeConfigPath - Optional path to kubeconfig file for authentication
   *
   * @since 1.0.0
   */
  constructor(
    page: Page | undefined,
    config: ClusterAuthConfig,
    virtctlPath = 'virtctl',
    kubeConfigPath?: string,
  ) {
    super(page, config);
    this.virtctlPath = virtctlPath;
    this.kubeConfigPath = kubeConfigPath;
  }

  /**
   * Executes a virtctl command and returns the result.
   *
   * This is the core method that handles all virtctl command execution. It automatically
   * handles kubeconfig configuration and command construction.
   *
   * @param args - Array of command arguments (e.g., ['migrate', 'vm-name', '-n', 'default'])
   * @param options - Optional execution options
   * @param options.ignoreError - Whether to ignore command errors and return empty string
   * @returns The command output as a string
   * @throws {Error} When command execution fails (unless ignoreError is true)
   * @private
   * @since 1.0.0
   */
  private async executeVirtctl(
    args: string[],
    options?: { ignoreError?: boolean },
  ): Promise<string> {
    const allArgs = [
      ...(this.kubeConfigPath ? [`--kubeconfig=${this.kubeConfigPath}`] : []),
      ...args,
    ];

    try {
      const { stderr: _stderr, stdout } = await execFileAsync(this.virtctlPath, allArgs, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: VIRTCTL_TIMEOUT_MS,
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
      const command = `${this.virtctlPath} ${allArgs.join(' ')}`;
      throw new Error(
        `Virtctl command failed: ${command}\nError: ${getErrorMessage(error)}\nStderr: ${stderr}`,
      );
    }
  }

  /**
   * Adds an SSH public key to a VM using virtctl credentials command.
   * This allows SSH access to the VM using the corresponding private key.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param publicKeyPath - Path to the SSH public key file
   * @param username - Username to associate with the key (default: 'cloud-user')
   * @returns The command output as a string
   * @throws {Error} When the command fails
   * @since 1.0.0
   */
  async addSSHKeyToVm(
    vmName: string,
    namespace: string,
    publicKeyPath: string,
    username = 'cloud-user',
  ): Promise<string> {
    if (!fs.existsSync(publicKeyPath)) {
      throw new Error(`SSH public key file not found: ${publicKeyPath}`);
    }

    const args = [
      'credentials',
      'add-ssh-key',
      '--user',
      username,
      '-n',
      namespace,
      '--file',
      publicKeyPath,
      vmName,
    ];

    return await this.executeVirtctl(args);
  }

  /**
   * Creates an SSH key pair file for testing.
   * Returns the paths to both the private and public key files.
   *
   * @param keyName - Base name for the key files (default: 'test-ssh-key')
   * @param outputDir - Directory to store key files (default: '.test-data')
   * @returns Object with paths to private and public key files
   * @since 1.0.0
   */
  async createSSHKeyPair(
    keyName = 'test-ssh-key',
    outputDir = '.test-data',
  ): Promise<{ privateKeyPath: string; publicKeyPath: string }> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const privateKeyPath = path.join(outputDir, keyName);
    const publicKeyPath = path.join(outputDir, `${keyName}.pub`);

    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      return { privateKeyPath, publicKeyPath };
    }

    try {
      await execFileAsync(
        'ssh-keygen',
        ['-t', 'rsa', '-b', '4096', '-f', privateKeyPath, '-N', '', '-q'],
        {
          maxBuffer: 10 * 1024 * 1024,
          timeout: SSH_KEYGEN_TIMEOUT_MS,
        },
      );

      fs.chmodSync(privateKeyPath, 0o600);

      return { privateKeyPath, publicKeyPath };
    } catch (error: unknown) {
      throw new Error(`Failed to generate SSH key pair: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Execute a raw virtctl command (for advanced use cases).
   *
   * This method allows executing any virtctl command directly, useful for commands
   * that don't have dedicated methods or for testing new features.
   *
   * @param command - The full virtctl command as a string (e.g., 'migrate vm-name -n default')
   * @returns The command output as a string
   * @throws {Error} When command execution fails
   * @since 1.0.0
   */
  async executeRawCommand(command: string): Promise<string> {
    return await this.executeVirtctl(command.split(' '));
  }

  /**
   * Execute a command inside a VM via SSH using virtctl.
   *
   * This method uses virtctl ssh to execute commands inside the VM's guest OS.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param command - Command to execute inside the VM
   * @param options - Optional SSH configuration
   * @param options.sshKeyPath - Path to SSH key file (default: 'fixtures/cnv.key')
   * @param options.username - SSH username (default: 'cloud-user')
   * @returns The command output as a string
   * @throws {Error} When SSH command execution fails
   * @since 1.0.0
   */
  async executeSshCommand(
    vmName: string,
    namespace: string,
    command: string,
    options?: {
      sshKeyPath?: string;
      username?: string;
    },
  ): Promise<string> {
    const sshKeyPath = options?.sshKeyPath ?? 'fixtures/cnv.key';
    const username = options?.username ?? 'cloud-user';

    const args = ['ssh', '-i', sshKeyPath, `${username}@${vmName}`, '-n', namespace, '-c', command];

    return await this.executeVirtctl(args);
  }

  /**
   * Get the VM's guest OS uptime in seconds.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param options - Optional SSH configuration
   * @param options.sshKeyPath - Path to SSH key file (default: 'fixtures/cnv.key')
   * @param options.username - SSH username (default: 'cloud-user')
   * @returns Uptime in seconds, or null if unable to determine
   * @since 1.0.0
   */
  async getGuestOsUptime(
    vmName: string,
    namespace: string,
    options?: {
      sshKeyPath?: string;
      username?: string;
    },
  ): Promise<number | null> {
    try {
      const uptimeOutput = await this.executeSshCommand(
        vmName,
        namespace,
        "awk '{print $1}' /proc/uptime",
        options,
      );

      const trimmedOutput = uptimeOutput.trim();
      if (!trimmedOutput) {
        return null;
      }

      const uptimeSeconds = parseFloat(trimmedOutput);
      return isNaN(uptimeSeconds) ? null : uptimeSeconds;
    } catch {
      return null;
    }
  }

  /**
   * Upload an image to a PVC using virtctl.
   *
   * @param namespace - Namespace where the PVC will be created
   * @param pvcName - Name of the PVC to create
   * @param size - Size of the PVC (e.g., '1Gi')
   * @param imagePath - Local path to the image file
   * @returns The command output as a string
   */
  async imageUpload(
    namespace: string,
    pvcName: string,
    size: string,
    imagePath: string,
  ): Promise<string> {
    const args = [
      'image-upload',
      '-n',
      namespace,
      'pvc',
      pvcName,
      `--size=${size}`,
      `--image-path=${imagePath}`,
      '--insecure',
      '--force-bind',
    ];
    return await this.executeVirtctl(args);
  }

  /**
   * Check if the VM's guest OS is rebooting by checking system uptime.
   * A system is considered rebooting if uptime is very low (less than 30 seconds).
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param options - Optional SSH configuration
   * @param options.sshKeyPath - Path to SSH key file (default: 'fixtures/cnv.key')
   * @param options.username - SSH username (default: 'cloud-user')
   * @param options.rebootThresholdSeconds - Uptime threshold in seconds to consider as rebooting (default: 30)
   * @returns True if the system appears to be rebooting, false otherwise
   * @throws {Error} When SSH command execution fails
   * @since 1.0.0
   */
  async isGuestOsRebooting(
    vmName: string,
    namespace: string,
    options?: {
      sshKeyPath?: string;
      username?: string;
      rebootThresholdSeconds?: number;
    },
  ): Promise<boolean> {
    try {
      const uptimeOutput = await this.executeSshCommand(
        vmName,
        namespace,
        "awk '{print $1}' /proc/uptime",
        options,
      );

      const trimmedOutput = uptimeOutput.trim();
      if (!trimmedOutput) {
        return false;
      }

      const uptimeSeconds = parseFloat(trimmedOutput);
      if (isNaN(uptimeSeconds)) {
        return false;
      }

      const threshold = options?.rebootThresholdSeconds ?? 30;
      return uptimeSeconds < threshold;
    } catch {
      return false;
    }
  }

  /**
   * Check if virtctl CLI is available
   *
   * @returns true if virtctl is available, false otherwise
   * @since 1.0.0
   */
  async isVirtctlAvailable(): Promise<boolean> {
    try {
      await this.executeVirtctl(['version'], { ignoreError: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Migrate a VirtualMachine to a different node.
   *
   * This method executes the virtctl migrate command to migrate a VM to a different node.
   * The migration is performed live, meaning the VM continues running during the migration.
   *
   * @param vmName - Name of the VirtualMachine to migrate
   * @param namespace - Namespace where the VM exists
   * @returns The command output as a string
   * @throws {Error} When migration command fails
   * @since 1.0.0
   */
  async migrateVm(vmName: string, namespace: string): Promise<string> {
    return await this.executeVirtctl(['migrate', vmName, '-n', namespace]);
  }

  /**
   * Pause a VirtualMachine (or VMI) using virtctl.
   * The VM must be Running for pause to apply.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @returns The command output as a string
   * @throws {Error} When pause command fails
   */
  async pauseVm(vmName: string, namespace: string): Promise<string> {
    return await this.executeVirtctl(['pause', 'vm', vmName, '-n', namespace]);
  }

  /**
   * Removes SSH credentials from a VM.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param username - Username whose credentials to remove (default: 'cloud-user')
   * @returns The command output as a string
   * @since 1.0.0
   */
  async removeSSHKeyFromVm(
    vmName: string,
    namespace: string,
    username = 'cloud-user',
  ): Promise<string> {
    const args = ['credentials', 'remove-ssh-key', '--user', username, '-n', namespace, vmName];

    return await this.executeVirtctl(args, { ignoreError: true });
  }

  /**
   * Creates SSH key pair and adds the public key to a VM.
   * This is a convenience method that combines key generation and VM configuration.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param options - Optional configuration
   * @param options.keyName - Base name for the key files
   * @param options.username - Username to associate with the key
   * @param options.outputDir - Directory to store key files
   * @returns Object with key paths and command output
   * @since 1.0.0
   */
  async setupSSHKeyForVm(
    vmName: string,
    namespace: string,
    options?: {
      keyName?: string;
      username?: string;
      outputDir?: string;
    },
  ): Promise<{ privateKeyPath: string; publicKeyPath: string; output: string }> {
    const keyName = options?.keyName ?? `ssh-key-${vmName}`;
    const username = options?.username ?? 'cloud-user';
    const outputDir = options?.outputDir ?? '.test-data';

    const { privateKeyPath, publicKeyPath } = await this.createSSHKeyPair(keyName, outputDir);

    const output = await this.addSSHKeyToVm(vmName, namespace, publicKeyPath, username);

    return { privateKeyPath, publicKeyPath, output };
  }
}
