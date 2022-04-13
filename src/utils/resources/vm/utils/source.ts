import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import { TemplateBootSource } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

import { getDisks, getVolumes } from './selectors';

/**
 * a function to get the boot source from a vm and its status
 * @param {V1VirtualMachine} vm - the vm to get the boot source from
 * @returns the vm's boot source and its status
 */
export const getVMBootSourceType = (vm: V1VirtualMachine): TemplateBootSource => {
  // TODO: we will need to ad support for boot order in the future
  const disk = getDisks(vm)?.[0];
  const volume = getVolumes(vm)?.find((vol) => vol.name === disk?.name);
  const dataVolumeTemplate = vm?.spec?.dataVolumeTemplates?.find(
    (dv) => dv.metadata?.name === volume?.dataVolume?.name,
  );

  if (dataVolumeTemplate?.spec?.sourceRef) {
    const sourceRef = dataVolumeTemplate?.spec?.sourceRef;

    if (sourceRef?.kind === DataSourceModel.kind) {
      return {
        type: BOOT_SOURCE.PVC_AUTO_UPLOAD,
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

  return null;
};
