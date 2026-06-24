import type { TemplateConfig, TemplateParameter } from './template-factory';

type TemplateCreator = (config?: Partial<TemplateConfig>) => string;

export function createCustomResourcesTemplate(
  create: TemplateCreator,
  name: string,
  cpuCores: number,
  memory: string,
  namespace?: string,
): string {
  return create({
    cpuCores,
    cpuSockets: 1,
    cpuThreads: 1,
    description: `Custom template: ${name}`,
    displayName: `Custom ${name}`,
    memory,
    name,
    namespace,
  });
}

export function createFedoraServerTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
): string {
  return create({
    description: 'Fedora server template',
    displayName: 'Fedora Server',
    iconClass: 'icon-fedora',
    name,
    namespace,
    osLabel: 'fedora',
    osName: 'Fedora',
    workload: 'server',
    workloadLabel: 'server',
  });
}

export function createHighPerformanceTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
): string {
  return create({
    cpuCores: 4,
    cpuSockets: 2,
    cpuThreads: 2,
    description: 'High-performance template',
    displayName: 'High Performance VM',
    flavor: 'large',
    memory: '16Gi',
    name,
    namespace,
    size: 'large',
    workload: 'highperformance',
    workloadLabel: 'highperformance',
  });
}

export function createMinimalTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
): string {
  return create({
    description: `Minimal template: ${name}`,
    displayName: `${name} template`,
    name,
    namespace,
  });
}

export function createRHELServerTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
  version = '9',
): string {
  return create({
    cloudInitUser: 'cloud-user',
    description: `RHEL ${version} server template`,
    displayName: `RHEL ${version} Server`,
    iconClass: 'icon-redhat',
    name,
    namespace,
    os: `rhel${version}`,
    osLabel: `rhel${version}`,
    osName: `RHEL ${version}`,
    rootDiskImage: `quay.io/containerdisks/rhel${version}`,
    workload: 'server',
    workloadLabel: 'server',
  });
}

export function createUbuntuServerTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
  version = '22.04',
): string {
  return create({
    cloudInitUser: 'ubuntu',
    description: `Ubuntu ${version} server template`,
    displayName: `Ubuntu ${version} Server`,
    iconClass: 'icon-ubuntu',
    name,
    namespace,
    os: 'ubuntu',
    osLabel: 'ubuntu',
    osName: 'Ubuntu',
    rootDiskImage: `quay.io/containerdisks/ubuntu:${version}`,
    workload: 'server',
    workloadLabel: 'server',
  });
}

export function createWindowsDesktopTemplate(
  create: TemplateCreator,
  name: string,
  namespace?: string,
  version = '10',
): string {
  return create({
    cloudInitUser: 'Administrator',
    cpuCores: 2,
    description: `Windows ${version} desktop template`,
    displayName: `Windows ${version} Desktop`,
    flavor: 'medium',
    iconClass: 'icon-windows',
    memory: '8Gi',
    name,
    namespace,
    os: `win${version}`,
    osLabel: `win${version}`,
    osName: `Windows ${version}`,
    rootDiskImage: `quay.io/containerdisks/windows-${version}`,
    size: 'medium',
    workload: 'desktop',
    workloadLabel: 'desktop',
  });
}

export function createWithCustomParametersTemplate(
  create: TemplateCreator,
  name: string,
  namespace: string | undefined,
  parameters: TemplateParameter[],
): string {
  return create({
    additionalParameters: parameters,
    name,
    namespace,
  });
}
