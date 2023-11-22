import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  BOOT_SOURCE,
  BOOT_SOURCE_LABELS,
  DATA_SOURCE_CRONJOB_LABEL,
} from '@kubevirt-utils/resources/template';
import { TemplateBootSource } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';

import { getBootDisk, getVolumes } from './selectors';

/**
 * A function to get the data source from a vm and its name and namespace
 * @param {V1VirtualMachine} vm - the vm to get the data source from.
 * @returns {V1beta1DataVolumeSourcePVC | V1beta1DataVolumeSourceRef} - The vms data volume source.
 */
export const getPVCSourceOrSourceRef = (
  vm: V1VirtualMachine,
): V1beta1DataVolumeSourcePVC | V1beta1DataVolumeSourceRef => {
  const bootDisk = getBootDisk(vm);
  const volume = getVolumes(vm)?.find((vol) => vol.name === bootDisk?.name);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === volume?.dataVolume?.name,
  );
  const sourceRef = dataVolumeTemplate?.spec?.sourceRef;
  const pvc = dataVolumeTemplate?.spec?.source?.pvc;

  if (sourceRef && sourceRef?.kind === DataSourceModel.kind) {
    return sourceRef;
  }

  if (pvc) {
    return {
      kind: PersistentVolumeClaimModel?.kind,
      name: pvc?.name,
      namespace: pvc?.namespace,
    };
  }

  return {} as V1beta1DataVolumeSourcePVC;
};

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
        source: { sourceRef },
        type: BOOT_SOURCE.DATA_SOURCE,
      };
    }
  }

  if (dataVolumeTemplate?.spec?.source) {
    const source = dataVolumeTemplate?.spec?.source;

    if (source?.http) {
      return {
        source: { http: source?.http },
        type: BOOT_SOURCE.URL,
      };
    }
    if (source?.registry) {
      return {
        source: { registry: source?.registry },
        type: BOOT_SOURCE.REGISTRY,
      };
    }
    if (source?.pvc) {
      return {
        source: { pvc: source?.pvc },
        type: BOOT_SOURCE.PVC,
      };
    }
  }

  if (volume?.containerDisk) {
    return {
      source: {
        containerDisk: volume?.containerDisk,
      },
      type: BOOT_SOURCE.CONTAINER_DISK,
    };
  }

  if (volume?.persistentVolumeClaim) {
    return {
      source: {
        pvc: { name: volume?.persistentVolumeClaim.claimName, namespace: vm?.metadata?.namespace },
      },
      type: BOOT_SOURCE.PVC,
    };
  }

  return { source: {}, type: BOOT_SOURCE.NONE };
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
