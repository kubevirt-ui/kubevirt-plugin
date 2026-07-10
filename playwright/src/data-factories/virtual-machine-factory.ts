import { generateRandomPassword } from '../utils/random-data-generator';

import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

/**
 * Data factory for generating VirtualMachine YAML configurations
 * Uses string interpolation to dynamically create different VM configs
 */

export interface VirtualMachineConfig extends BaseResourceConfig {
  // Boot mode configuration
  bootMode?: 'bios' | 'uefi' | 'uefi-secure';
  // Cloud-init configuration
  cloudInitDiskName?: string;
  cloudInitPassword?: string;
  cloudInitUser?: string;
  cpuCores?: number;
  cpuSockets?: number;
  cpuThreads?: number;
  description?: string;
  flavor?: 'large' | 'medium' | 'small' | 'tiny';
  hostname?: string;
  // Network configuration
  interfaceModel?: 'e1000' | 'e1000e' | 'rtl8139' | 'virtio';
  memory?: string;
  networkInterfaceMultiqueue?: boolean;
  networkName?: string;

  os?: string;
  osLabel?: string;
  rootDiskBus?: 'sata' | 'scsi' | 'virtio';

  rootDiskImage?: string;
  // Disk configurations
  rootDiskName?: string;
  runStrategy?: 'Always' | 'Halted' | 'Manual' | 'RerunOnFailure';

  // Size label
  size?: 'large' | 'medium' | 'small' | 'tiny';
  terminationGracePeriodSeconds?: number;

  workload?: 'desktop' | 'highperformance' | 'server';
}

export class VirtualMachineFactory extends BaseDataFactory {
  private static defaultConfig: VirtualMachineConfig = {
    cloudInitDiskName: 'cloudinitdisk',
    cloudInitUser: 'fedora',
    cpuCores: 1,
    cpuSockets: 1,
    cpuThreads: 1,
    description: 'VM example',
    flavor: 'small',
    hostname: 'example',
    interfaceModel: 'virtio',
    memory: '2Gi',
    name: 'example',
    networkInterfaceMultiqueue: true,
    networkName: 'default',
    os: 'fedora',
    osLabel: 'fedora',
    rootDiskBus: 'virtio',
    rootDiskImage: 'quay.io/containerdisks/fedora',
    rootDiskName: 'rootdisk',
    runStrategy: 'Always',
    size: 'small',
    terminationGracePeriodSeconds: 180,
    workload: 'server',
  };

  /**
   * Generate a VirtualMachine YAML configuration
   * @param config - Configuration options for the VM (will be merged with defaults)
   * @returns YAML string representation of the VirtualMachine
   */
  static create(config: Partial<VirtualMachineConfig> = {}): string {
    const vm = this.mergeConfig(this.defaultConfig, {
      cloudInitPassword: config.cloudInitPassword ?? generateRandomPassword(),
      ...config,
    });

    // Build custom labels and annotations using base class utilities
    const customLabels = this.buildLabelsSection(vm.customLabels);
    const customAnnotations = this.buildAnnotationsSection(vm.customAnnotations);

    // Build firmware and features sections based on boot mode
    const bootMode = vm.bootMode || 'bios';
    // For UEFI: enable SMM and disable Secure Boot explicitly
    // For UEFI Secure Boot: enable SMM and enable Secure Boot explicitly
    // Note: KubeVirt enables Secure Boot by default when efi: {} is specified,
    // so we must explicitly set secureBoot: false for regular UEFI
    let firmwareSection = '';
    if (bootMode === 'uefi') {
      firmwareSection = `        firmware:
          bootloader:
            efi:
              secureBoot: false
`;
    } else if (bootMode === 'uefi-secure') {
      firmwareSection = `        firmware:
          bootloader:
            efi:
              secureBoot: true
`;
    }

    // Both UEFI and UEFI Secure Boot require SMM to be enabled
    const featuresSection =
      bootMode === 'uefi' || bootMode === 'uefi-secure'
        ? `        features:
          acpi: {}
          smm:
            enabled: true
`
        : '';

    const yaml = `apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${vm.name}${this.addNamespaceField(vm.namespace)}
  annotations:
    description: ${vm.description}${customAnnotations ? `\n${customAnnotations}` : ''}
  labels:
    app: ${vm.name}
    os.template.kubevirt.io/${vm.osLabel}: 'true'${customLabels ? `\n${customLabels}` : ''}
spec:
  runStrategy: ${vm.runStrategy}
  template:
    metadata:
      annotations:
        vm.kubevirt.io/flavor: ${vm.flavor}
        vm.kubevirt.io/os: ${vm.os}
        vm.kubevirt.io/workload: ${vm.workload}
      labels:
        kubevirt.io/domain: ${vm.name}
        kubevirt.io/size: ${vm.size}
    spec:
      domain:
        cpu:
          cores: ${vm.cpuCores}
          sockets: ${vm.cpuSockets}
          threads: ${vm.cpuThreads}
        devices:
          disks:
            - disk:
                bus: ${vm.rootDiskBus}
              name: ${vm.rootDiskName}
            - disk:
                bus: ${vm.rootDiskBus}
              name: ${vm.cloudInitDiskName}
          interfaces:
            - masquerade: {}
              model: ${vm.interfaceModel}
              name: ${vm.networkName}
          networkInterfaceMultiqueue: ${vm.networkInterfaceMultiqueue}
          rng: {}
${featuresSection}${firmwareSection}        memory:
          guest: ${vm.memory}
      hostname: ${vm.hostname}
      networks:
        - name: ${vm.networkName}
          pod: {}
      terminationGracePeriodSeconds: ${vm.terminationGracePeriodSeconds}
      volumes:
        - name: ${vm.rootDiskName}
          containerDisk:
            image: ${vm.rootDiskImage}
        - cloudInitNoCloud:
            userData: |-
              #cloud-config
              user: ${vm.cloudInitUser}
              password: ${vm.cloudInitPassword}
              chpasswd: { expire: False }
          name: ${vm.cloudInitDiskName}`;

    return yaml;
  }

  /**
   * Create a VM with custom resource specifications
   */
  static createCustomResources(
    name: string,
    cpuCores: number,
    memory: string,
    namespace?: string,
  ): string {
    return this.create({
      cpuCores,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Custom VM: ${name}`,
      hostname: name,
      memory,
      name,
      namespace,
    });
  }

  /**
   * Create a desktop workload VM configuration
   */
  static createDesktop(name: string, namespace?: string): string {
    return this.create({
      cpuCores: 2,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Desktop VM: ${name}`,
      flavor: 'medium',
      hostname: name,
      memory: '4Gi',
      name,
      namespace,
      size: 'medium',
      workload: 'desktop',
    });
  }

  /**
   * Create a high-performance VM configuration
   */
  static createHighPerformance(name: string, namespace?: string): string {
    return this.create({
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      description: `High-performance VM: ${name}`,
      flavor: 'large',
      hostname: name,
      memory: '16Gi',
      name,
      namespace,
      size: 'large',
      workload: 'highperformance',
    });
  }

  /**
   * Create a minimal VM configuration with just required fields
   */
  static createMinimal(name: string, namespace?: string): string {
    return this.create({
      description: `Minimal VM: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a RHEL VM configuration
   */
  static createRHEL(name: string, namespace?: string, version = '9'): string {
    return this.create({
      cloudInitUser: 'cloud-user',
      cpuCores: 2,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `RHEL ${version} VM: ${name}`,
      flavor: 'medium',
      hostname: name,
      memory: '4Gi',
      name,
      namespace,
      os: `rhel${version}`,
      osLabel: `rhel${version}`,
      rootDiskImage: `quay.io/containerdisks/rhel${version}`,
      size: 'medium',
      workload: 'server',
    });
  }

  /**
   * Create a VM with running strategy set to Always
   */
  static createRunning(name: string, namespace?: string): string {
    return this.create({
      description: `Running VM: ${name}`,
      hostname: name,
      name,
      namespace,
      runStrategy: 'Always',
    });
  }

  /**
   * Create an Ubuntu VM configuration
   */
  static createUbuntu(name: string, namespace?: string, version = '22.04'): string {
    return this.create({
      cloudInitUser: 'ubuntu',
      cpuCores: 2,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Ubuntu ${version} VM: ${name}`,
      flavor: 'small',
      hostname: name,
      memory: '2Gi',
      name,
      namespace,
      os: 'ubuntu',
      osLabel: 'ubuntu',
      rootDiskImage: `quay.io/containerdisks/ubuntu:${version}`,
      size: 'small',
      workload: 'server',
    });
  }

  /**
   * Create a Windows VM configuration
   */
  static createWindows(name: string, namespace?: string): string {
    return this.create({
      cloudInitUser: 'Administrator',
      cpuCores: 2,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Windows VM: ${name}`,
      flavor: 'medium',
      hostname: name,
      memory: '8Gi',
      name,
      namespace,
      os: 'win10',
      osLabel: 'win10',
      rootDiskImage: 'quay.io/containerdisks/windows-10',
      size: 'medium',
      workload: 'desktop',
    });
  }
}
