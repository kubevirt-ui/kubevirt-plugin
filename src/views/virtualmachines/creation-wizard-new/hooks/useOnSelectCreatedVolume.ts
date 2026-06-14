import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { InstanceTypeVMActions } from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/utils/types';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { VMWizardFormValues } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/types';
import { getDiskSize } from '@virtualmachines/creation-wizard-new/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';

export const applySelectedBootableVolumeToForm = (
  getValues: UseFormGetValues<VMWizardFormValues>,
  setValue: UseFormSetValue<VMWizardFormValues>,
  selectedVolume: BootableVolume,
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
  volumeSnapshotSource: VolumeSnapshotKind,
  dvSource: V1beta1DataVolume,
): void => {
  const instanceTypeName = getInstanceTypeFromVolume(selectedVolume);
  const [series = '', size = ''] = instanceTypeName?.split('.') || [];

  setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT, {
    ...getValues(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT),
    customDiskSize: getDiskSize(dvSource, pvcSource, volumeSnapshotSource),
    dvSource,
    pvcSource,
    selectedBootableVolume: selectedVolume,
    selectedInstanceType: {
      name: instanceTypeName,
      namespace: null,
    },
    selectedSeries: series,
    selectedSize: size,
    volumeSnapshotSource,
  });
};

// TODO: change type
export type OnSelectCreatedVolumeHandler = InstanceTypeVMActions['onSelectCreatedVolume'];

const useOnSelectCreatedVolume = (): OnSelectCreatedVolumeHandler => {
  const { getValues, setValue } = useVMWizard();

  return (selectedVolume, pvcSource, volumeSnapshotSource, dvSource) => {
    applySelectedBootableVolumeToForm(
      getValues,
      setValue,
      selectedVolume,
      pvcSource,
      volumeSnapshotSource,
      dvSource,
    );
  };
};

export default useOnSelectCreatedVolume;
