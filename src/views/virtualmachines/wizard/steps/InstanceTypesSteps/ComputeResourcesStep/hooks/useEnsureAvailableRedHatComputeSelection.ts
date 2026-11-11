import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { getDefaultRedHatComputeSelection } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/getDefaultRedHatComputeSelection';
import { pickDefaultRedHatInstanceTypeSeries } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/pickDefaultRedHatInstanceTypeSeries';

const getClusterInstanceTypesKey = (
  instanceTypes: V1beta1VirtualMachineClusterInstancetype[],
): string =>
  instanceTypes
    .map((instanceType) =>
      [
        instanceType.metadata?.name,
        instanceType.spec?.cpu?.guest,
        instanceType.spec?.memory?.guest,
      ].join(':'),
    )
    .join('|');

const useEnsureAvailableRedHatComputeSelection = (cluster: string | undefined): void => {
  const { control, setValue } = useVMWizardForm();
  const compute = useWatch({ control, name: 'instanceType.compute' });
  const { isFamilyVisible, loaded: familiesLoaded } = useDisabledInstanceTypeFamilies(cluster);
  const [clusterInstanceTypes, clusterInstanceTypesLoaded] = useClusterInstanceTypes(
    null,
    null,
    cluster,
  );
  const clusterInstanceTypesKey = getClusterInstanceTypesKey(clusterInstanceTypes);

  useEffect(() => {
    if (!familiesLoaded || !clusterInstanceTypesLoaded || (compute && compute.type !== 'redhat')) {
      return;
    }

    const selectedSeries = compute?.type === 'redhat' ? compute.series : undefined;
    const needsReplacement = !selectedSeries || !isFamilyVisible(selectedSeries);

    if (!needsReplacement) {
      return;
    }

    const redHatItems = getInstanceTypeMenuItems(clusterInstanceTypes).redHatProvided.items;
    const defaultSeries = pickDefaultRedHatInstanceTypeSeries(redHatItems, isFamilyVisible);

    if (!defaultSeries) {
      if (compute) {
        setValue('instanceType.compute', null, { shouldValidate: true });
      }
      return;
    }

    setValue('instanceType.compute', getDefaultRedHatComputeSelection(defaultSeries), {
      shouldValidate: true,
    });
  }, [
    clusterInstanceTypes,
    clusterInstanceTypesKey,
    clusterInstanceTypesLoaded,
    compute,
    familiesLoaded,
    isFamilyVisible,
    setValue,
  ]);
};

export default useEnsureAvailableRedHatComputeSelection;
