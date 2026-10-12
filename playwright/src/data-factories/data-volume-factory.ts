import type { KubernetesResource } from '@/data-models/kubernetes-types';

import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

/**
 * Data factory for generating DataVolume YAML configurations
 * DataVolumes are used to create bootable volumes for VirtualMachines
 */

export interface DataVolumeSourceConfig {
  http?: {
    url: string;
  };
  pvc?: {
    name: string;
    namespace: string;
  };
  registry?: {
    url: string;
  };
}

export interface DataVolumeStorageConfig {
  accessModes?: string[];
  requests: {
    storage: string;
  };
  storageClassName?: string;
  volumeMode?: string;
}

export interface DataVolumeConfig extends BaseResourceConfig {
  // CDI specific annotations
  bindImmediatelyRequested?: boolean;
  // Instance type and preference labels
  defaultInstanceType?: string;

  defaultPreference?: string;

  // Bootable volumes list display (annotations for UI columns)
  architecture?: string;
  description?: string;
  operatingSystem?: string;

  // Source configuration
  source: DataVolumeSourceConfig;

  // Storage configuration
  storage: DataVolumeStorageConfig;
}

export class DataVolumeFactory extends BaseDataFactory {
  private static defaultConfig: DataVolumeConfig = {
    bindImmediatelyRequested: true,
    defaultInstanceType: 'u1.medium',
    defaultPreference: 'fedora',
    name: 'example',
    namespace: 'default',
    architecture: 'amd64',
    description: 'Fedora bootable volume',
    operatingSystem: 'Fedora',
    source: {
      registry: {
        url: 'docker://quay.io/containerdisks/fedora:latest',
      },
    },
    storage: {
      requests: {
        storage: '30Gi',
      },
    },
  };

  /**
   * Generate a DataVolume YAML configuration
   * @param config - Configuration options for the DataVolume (will be merged with defaults)
   * @returns YAML string representation of the DataVolume
   */
  static create(config: Partial<DataVolumeConfig> = {}): string {
    const dataVolume = this.mergeConfig(this.defaultConfig, config);

    // Build labels section
    let labelsSection = '';
    const labels: Record<string, string> = {};

    if (dataVolume.defaultInstanceType) {
      labels['instancetype.kubevirt.io/default-instancetype'] = dataVolume.defaultInstanceType;
    }
    if (dataVolume.defaultPreference) {
      labels['instancetype.kubevirt.io/default-preference'] = dataVolume.defaultPreference;
    }

    // Add custom labels if provided
    if (dataVolume.customLabels) {
      Object.assign(labels, dataVolume.customLabels);
    }

    if (Object.keys(labels).length > 0) {
      labelsSection = '\n  labels:';
      Object.entries(labels).forEach(([key, value]) => {
        labelsSection += `\n    ${key}: ${value}`;
      });
    }

    // Build annotations section
    let annotationsSection = '';
    const annotations: Record<string, string> = {};

    if (dataVolume.bindImmediatelyRequested !== undefined) {
      annotations['cdi.kubevirt.io/storage.bind.immediate.requested'] =
        dataVolume.bindImmediatelyRequested.toString();
    }

    if (dataVolume.description !== undefined && dataVolume.description !== '') {
      annotations['description'] = dataVolume.description;
    }
    if (dataVolume.architecture !== undefined && dataVolume.architecture !== '') {
      annotations['cdi.kubevirt.io/architecture'] = dataVolume.architecture;
    }
    if (dataVolume.operatingSystem !== undefined && dataVolume.operatingSystem !== '') {
      annotations['cdi.kubevirt.io/operating-system'] = dataVolume.operatingSystem;
    }

    // Add custom annotations if provided
    if (dataVolume.customAnnotations) {
      Object.assign(annotations, dataVolume.customAnnotations);
    }

    if (Object.keys(annotations).length > 0) {
      annotationsSection = '\n  annotations:';
      Object.entries(annotations).forEach(([key, value]) => {
        annotationsSection += `\n    ${key}: '${value}'`;
      });
    }

    // Build metadata section
    let metadataSection = `metadata:
  name: ${dataVolume.name}`;

    if (dataVolume.namespace) {
      metadataSection += `\n  namespace: ${dataVolume.namespace}`;
    }

    if (labelsSection) {
      metadataSection += labelsSection;
    }

    if (annotationsSection) {
      metadataSection += annotationsSection;
    }

    // Build source section
    let sourceSection = '';
    if (dataVolume.source.registry) {
      sourceSection = `  source:
    registry:
      url: '${dataVolume.source.registry.url}'`;
    } else if (dataVolume.source.http) {
      sourceSection = `  source:
    http:
      url: '${dataVolume.source.http.url}'`;
    } else if (dataVolume.source.pvc) {
      sourceSection = `  source:
    pvc:
      name: ${dataVolume.source.pvc.name}
      namespace: ${dataVolume.source.pvc.namespace}`;
    }

    // Build storage section
    let storageSection = `  storage:
    resources:
      requests:
        storage: ${dataVolume.storage.requests.storage}`;

    if (dataVolume.storage.storageClassName) {
      storageSection = `  storage:
    storageClassName: ${dataVolume.storage.storageClassName}
    resources:
      requests:
        storage: ${dataVolume.storage.requests.storage}`;
    }

    if (dataVolume.storage.accessModes && dataVolume.storage.accessModes.length > 0) {
      const accessModes = dataVolume.storage.accessModes
        .map((mode) => `\n      - ${mode}`)
        .join('');
      storageSection = storageSection.replace(
        'resources:',
        `accessModes:${accessModes}\n    resources:`,
      );
    }

    if (dataVolume.storage.volumeMode) {
      storageSection = storageSection.replace(
        'resources:',
        `volumeMode: ${dataVolume.storage.volumeMode}\n    resources:`,
      );
    }

    const yaml = `apiVersion: cdi.kubevirt.io/v1beta1
kind: DataVolume
${metadataSection}
spec:
${sourceSection}
${storageSection}`;

    return yaml;
  }

  /**
   * Create a DataVolume for CentOS Stream (alternative to RHEL)
   */
  static createCentOsStreamVolume(name: string, storageSize = '30Gi', namespace?: string): string {
    return this.createFromRegistry(
      name,
      'docker://quay.io/containerdisks/centos-stream:9',
      storageSize,
      namespace,
      'u1.medium',
      'centos.stream9',
    );
  }

  /**
   * Create a DataVolume for CentOS Stream
   */
  static createCentOsVolume(name: string, storageSize = '30Gi', namespace?: string): string {
    return this.createFromRegistry(
      name,
      'docker://quay.io/containerdisks/centos-stream:9',
      storageSize,
      namespace,
      'u1.medium',
      'centos.stream9',
    );
  }

  /**
   * Create a comprehensive DataVolume with all options
   */
  static createComprehensive(
    name: string,
    config: {
      accessModes?: string[];
      bindImmediatelyRequested?: boolean;
      customAnnotations?: Record<string, string>;
      customLabels?: Record<string, string>;
      defaultInstanceType?: string;
      defaultPreference?: string;
      httpUrl?: string;
      namespace?: string;
      registryUrl?: string;
      storageClassName?: string;
      storageSize: string;
      volumeMode?: string;
    },
  ): string {
    const source: DataVolumeSourceConfig = {};

    if (config.registryUrl) {
      source.registry = { url: config.registryUrl };
    } else if (config.httpUrl) {
      source.http = { url: config.httpUrl };
    } else {
      // Default to fedora registry
      source.registry = { url: 'docker://quay.io/containerdisks/fedora:latest' };
    }

    return this.create({
      bindImmediatelyRequested: config.bindImmediatelyRequested,
      customAnnotations: config.customAnnotations,
      customLabels: config.customLabels,
      defaultInstanceType: config.defaultInstanceType,
      defaultPreference: config.defaultPreference,
      name,
      namespace: config.namespace,
      source,
      storage: {
        accessModes: config.accessModes,
        requests: {
          storage: config.storageSize,
        },
        storageClassName: config.storageClassName,
        volumeMode: config.volumeMode,
      },
    });
  }

  /**
   * Create a DataVolume for Fedora
   */
  static createFedoraVolume(name: string, storageSize = '30Gi', namespace?: string): string {
    return this.createFromRegistry(
      name,
      'docker://quay.io/containerdisks/fedora:latest',
      storageSize,
      namespace,
      'u1.medium',
      'fedora',
    );
  }

  /**
   * Create a DataVolume from an HTTP source
   */
  static createFromHttp(
    name: string,
    httpUrl: string,
    storageSize: string,
    namespace?: string,
    instanceType?: string,
    preference?: string,
  ): string {
    return this.create({
      defaultInstanceType: instanceType,
      defaultPreference: preference,
      name,
      namespace,
      source: {
        http: {
          url: httpUrl,
        },
      },
      storage: {
        requests: {
          storage: storageSize,
        },
      },
    });
  }

  /**
   * Create a DataVolume by cloning from an existing PVC
   */
  static createFromPvc(
    name: string,
    sourcePvcName: string,
    sourcePvcNamespace: string,
    storageSize: string,
    namespace?: string,
  ): string {
    return this.create({
      name,
      namespace,
      source: {
        pvc: {
          name: sourcePvcName,
          namespace: sourcePvcNamespace,
        },
      },
      storage: {
        requests: {
          storage: storageSize,
        },
      },
    });
  }

  /**
   * Create a DataVolume from a registry source
   */
  static createFromRegistry(
    name: string,
    registryUrl: string,
    storageSize: string,
    namespace?: string,
    instanceType?: string,
    preference?: string,
  ): string {
    return this.create({
      defaultInstanceType: instanceType,
      defaultPreference: preference,
      name,
      namespace,
      source: {
        registry: {
          url: registryUrl,
        },
      },
      storage: {
        requests: {
          storage: storageSize,
        },
      },
    });
  }

  /**
   * Create a minimal DataVolume with just required fields
   */
  static createMinimal(name: string, namespace?: string): string {
    return this.create({
      name,
      namespace,
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    });
  }

  /**
   * Generate a DataVolume resource object (for use with Kubernetes API)
   * @param config - Configuration options for the DataVolume (will be merged with defaults)
   * @returns DataVolume resource object
   */
  static createResourceObject(config: Partial<DataVolumeConfig> = {}): KubernetesResource {
    const dataVolume = this.mergeConfig(this.defaultConfig, config);

    // Build labels
    const labels: Record<string, string> = {};
    if (dataVolume.defaultInstanceType) {
      labels['instancetype.kubevirt.io/default-instancetype'] = dataVolume.defaultInstanceType;
    }
    if (dataVolume.defaultPreference) {
      labels['instancetype.kubevirt.io/default-preference'] = dataVolume.defaultPreference;
    }
    if (dataVolume.customLabels) {
      Object.assign(labels, dataVolume.customLabels);
    }

    // Build annotations
    const annotations: Record<string, string> = {};
    if (dataVolume.bindImmediatelyRequested !== undefined) {
      annotations['cdi.kubevirt.io/storage.bind.immediate.requested'] =
        dataVolume.bindImmediatelyRequested.toString();
    }
    if (dataVolume.description !== undefined && dataVolume.description !== '') {
      annotations['description'] = dataVolume.description;
    }
    if (dataVolume.architecture !== undefined && dataVolume.architecture !== '') {
      annotations['cdi.kubevirt.io/architecture'] = dataVolume.architecture;
    }
    if (dataVolume.operatingSystem !== undefined && dataVolume.operatingSystem !== '') {
      annotations['cdi.kubevirt.io/operating-system'] = dataVolume.operatingSystem;
    }
    if (dataVolume.customAnnotations) {
      Object.assign(annotations, dataVolume.customAnnotations);
    }

    // Build metadata
    const metadata: Record<string, unknown> = {
      name: dataVolume.name,
      ...(Object.keys(labels).length > 0 && { labels }),
      ...(Object.keys(annotations).length > 0 && { annotations }),
    };
    if (dataVolume.namespace) {
      metadata.namespace = dataVolume.namespace;
    }

    // Build source
    const source: Record<string, unknown> = {};
    if (dataVolume.source.registry) {
      source.registry = {
        url: dataVolume.source.registry.url,
      };
    } else if (dataVolume.source.http) {
      source.http = {
        url: dataVolume.source.http.url,
      };
    } else if (dataVolume.source.pvc) {
      source.pvc = {
        name: dataVolume.source.pvc.name,
        namespace: dataVolume.source.pvc.namespace,
      };
    }

    // Build storage
    const storage: Record<string, unknown> = {
      resources: {
        requests: {
          storage: dataVolume.storage.requests.storage,
        },
      },
    };
    if (dataVolume.storage.storageClassName) {
      storage.storageClassName = dataVolume.storage.storageClassName;
    }
    if (dataVolume.storage.accessModes && dataVolume.storage.accessModes.length > 0) {
      storage.accessModes = dataVolume.storage.accessModes;
    }
    if (dataVolume.storage.volumeMode) {
      storage.volumeMode = dataVolume.storage.volumeMode;
    }

    return {
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataVolume',
      metadata,
      spec: {
        source,
        storage,
      },
    };
  }

  /**
   * Create a DataVolume with specific storage class
   */
  static createWithStorageClass(
    name: string,
    registryUrl: string,
    storageSize: string,
    storageClassName: string,
    namespace?: string,
  ): string {
    return this.create({
      name,
      namespace,
      source: {
        registry: {
          url: registryUrl,
        },
      },
      storage: {
        requests: {
          storage: storageSize,
        },
        storageClassName,
      },
    });
  }
}
