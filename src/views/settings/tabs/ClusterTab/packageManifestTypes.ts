// Extracted from types.ts
// Root: src/views/clusteroverview/utils/types.ts

import { type K8sResourceKind } from './csvTypes';
import { type InstallModeType } from './csvTypes';
import { type APIServiceDefinition, type CRDDescription } from './descriptorTypes';

export type PackageManifestKind = {
  apiVersion: 'packages.operators.coreos.com/v1';
  kind: 'PackageManifest';
  spec: unknown;
  status: {
    catalogSource: string;
    catalogSourceDisplayName: string;
    catalogSourceNamespace: string;
    catalogSourcePublisher: string;
    channels: {
      currentCSV: string;
      currentCSVDesc: {
        annotations?: Record<string, string>;
        apiservicedefinitions?: {
          owned?: APIServiceDefinition[];
          required?: APIServiceDefinition[];
        };
        customresourcedefinitions?: { owned?: CRDDescription[]; required?: CRDDescription[] };
        description?: string;
        displayName: string;
        icon: { base64data: string; mediatype: string }[];
        installModes: { supported: boolean; type: InstallModeType }[];
        keywords?: string[];
        provider: {
          name: string;
        };
        version: string;
      };
      deprecation?: { message: string };
      entries?: {
        deprecation?: { message: string };
        name: string;
        version: string;
      }[];
      name: string;
    }[];
    defaultChannel: string;
    deprecation?: { message: string };
    packageName: string;
    provider: {
      name: string;
    };
  };
} & K8sResourceKind;
