import { V1beta1Provider } from '@kubev2v/types';

import { TELEMETRY_SOURCE_PROVIDER } from './property-constants';
import { SourceProviderTelemetry } from './types';

export const mapMtvProviderTypeToTelemetry = (type?: string): SourceProviderTelemetry => {
  const normalized = type?.toLowerCase() ?? '';

  if (normalized.includes('vsphere') || normalized === 'vmware') {
    return TELEMETRY_SOURCE_PROVIDER.VSPHERE;
  }
  if (normalized.includes('ovirt')) {
    return TELEMETRY_SOURCE_PROVIDER.OVIRT;
  }
  if (normalized.includes('rhv') || normalized.includes('redhat')) {
    return TELEMETRY_SOURCE_PROVIDER.RHV;
  }
  if (normalized.includes('openstack')) {
    return TELEMETRY_SOURCE_PROVIDER.OPENSTACK;
  }

  return TELEMETRY_SOURCE_PROVIDER.OTHER;
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
