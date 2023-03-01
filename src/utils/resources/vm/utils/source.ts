import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  BOOT_SOURCE,
  BOOT_SOURCE_LABELS,
  DATA_SOURCE_CRONJOB_LABEL,
} from '@kubevirt-utils/resources/template';
import { TemplateBootSource } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

import { getBootDisk, getVolumes } from './selectors';

/**
 * a function to get the boot source from a vm and its status
 * @param {V1VirtualMachine} vm - the vm to get the boot source from
 * @returns the vm's boot source and its status
 */
export const getVMBootSourceType = (vm: V1VirtualMachine): TemplateBootSource => {
  const bootDisk = getBootDisk(vm);
  const volume = getVolumes(vm)?.find((vol) => vol.name === bootDisk?.name);
  const dataVolumeTemplate = vm?.spec?.dataVolumeTemplates?.find(
    (dv) => dv.metadata?.name === volume?.dataVolume?.name,
  );

  if (dataVolumeTemplate?.spec?.sourceRef) {
    const sourceRef = dataVolumeTemplate?.spec?.sourceRef;

    if (sourceRef?.kind === DataSourceModel.kind) {
      return {
        type: BOOT_SOURCE.DATA_SOURCE,
        source: { sourceRef },
      };
    }
  }

  if (dataVolumeTemplate?.spec?.source) {
    const source = dataVolumeTemplate?.spec?.source;

    if (source?.http) {
      return {
        type: BOOT_SOURCE.URL,
        source: { http: source?.http },
      };
    }
    if (source?.registry) {
      return {
        type: BOOT_SOURCE.REGISTRY,
        source: { registry: source?.registry },
      };
    }
    if (source?.pvc) {
      return {
        type: BOOT_SOURCE.PVC,
        source: { pvc: source?.pvc },
      };
    }
  }

  if (volume?.containerDisk) {
    return {
      type: BOOT_SOURCE.CONTAINER_DISK,
      source: {
        containerDisk: volume?.containerDisk,
      },
    };
  }

  if (volume?.persistentVolumeClaim) {
    return {
      type: BOOT_SOURCE.PVC,
      source: {
        pvc: { name: volume?.persistentVolumeClaim.claimName, namespace: vm?.metadata?.namespace },
      },
    };
  }

  return { type: BOOT_SOURCE.NONE, source: {} };
};

/**
 * Function to get a human comprehensive label to describe the vm boot source
 * @param {BOOT_SOURCE} bootSourceType - vm boot source type
 * @param {V1beta1DataSource} dataSource - if any, the vm boot data source
 * @returns label representing the boot source type
 */
export const getVMBootSourceLabel = (
  bootSourceType: BOOT_SOURCE,
  dataSource?: V1beta1DataSource,
): string => {
  if (BOOT_SOURCE.DATA_SOURCE && dataSource?.metadata?.labels?.[DATA_SOURCE_CRONJOB_LABEL])
    return BOOT_SOURCE_LABELS[BOOT_SOURCE.DATA_SOURCE_AUTO_IMPORT] || 'N/A';

  return BOOT_SOURCE_LABELS[bootSourceType] || 'N/A';
};
