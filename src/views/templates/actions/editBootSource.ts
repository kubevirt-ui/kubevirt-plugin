import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1DataVolumeTemplateSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { poorManProcess } from '@kubevirt-utils/resources/template';
import { getDataSource } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVolumes } from '@kubevirt-utils/resources/vm';

const getRootDiskDataVolume = (template: V1Template): V1DataVolumeTemplateSpec | undefined => {
  const vm = getTemplateVirtualMachineObject(template);

  const rootVolume = getVolumes(vm)?.find((volume) => volume.name === 'rootdisk');

  return vm?.spec?.dataVolumeTemplates?.find(
    (dataVolumeTemplate) => rootVolume?.dataVolume?.name === dataVolumeTemplate?.metadata?.name,
  );
};

export const hasEditableBootSource = async (template: V1Template): Promise<boolean> => {
  const templateWithDefaultParameters = poorManProcess(template);
  const dataVolume = getRootDiskDataVolume(templateWithDefaultParameters);

  if (!dataVolume?.spec?.sourceRef || dataVolume?.spec?.sourceRef?.kind !== DataSourceModel.kind) {
    return false;
  }

  try {
    const dataSource = await getDataSource(
      dataVolume?.spec?.sourceRef.name,
      dataVolume?.spec?.sourceRef.namespace,
    );

    return !dataSource.metadata.labels['cdi.kubevirt.io/dataImportCron'];
  } catch (error) {
    return false;
  }
};
