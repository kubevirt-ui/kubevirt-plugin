import { V1beta1Provider } from '@kubev2v/types';

import { MTV_PROVIDER_TYPE, TELEMETRY_SOURCE_PROVIDER } from './property-constants';
import { SourceProviderTelemetry } from './types';

const MTV_PROVIDER_TYPE_TO_TELEMETRY: {
  keywords: readonly string[];
  provider: SourceProviderTelemetry;
}[] = [
  {
    keywords: [MTV_PROVIDER_TYPE.VSPHERE, MTV_PROVIDER_TYPE.VMWARE],
    provider: TELEMETRY_SOURCE_PROVIDER.VSPHERE,
  },
  {
    keywords: [MTV_PROVIDER_TYPE.OVIRT],
    provider: TELEMETRY_SOURCE_PROVIDER.OVIRT,
  },
  {
    keywords: [MTV_PROVIDER_TYPE.RHV, MTV_PROVIDER_TYPE.REDHAT],
    provider: TELEMETRY_SOURCE_PROVIDER.RHV,
  },
  {
    keywords: [MTV_PROVIDER_TYPE.OPENSTACK],
    provider: TELEMETRY_SOURCE_PROVIDER.OPENSTACK,
  },
];

export const mapMtvProviderTypeToTelemetry = (type?: string): SourceProviderTelemetry => {
  const normalized = type?.toLowerCase() ?? '';
  const match = MTV_PROVIDER_TYPE_TO_TELEMETRY.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return match?.provider ?? TELEMETRY_SOURCE_PROVIDER.OTHER;
};

export const getMtvSourceTelemetry = (provider?: V1beta1Provider) => {
  const sourceVersion =
    provider?.spec?.settings?.version ??
    provider?.spec?.settings?.productVersion ??
    provider?.spec?.url;

  return {
    sourceProvider: mapMtvProviderTypeToTelemetry(provider?.spec?.type),
    ...(sourceVersion && { sourceVersion }),
  };
};
