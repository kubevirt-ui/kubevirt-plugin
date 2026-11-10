import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { type RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { getDefaultRedHatComputeSelection } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/getDefaultRedHatComputeSelection';
import { pickDefaultRedHatInstanceTypeSeries } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/pickDefaultRedHatInstanceTypeSeries';

const useEnsureAvailableRedHatComputeSelection = (
  cluster: string | undefined,
  redHatMenuItems: RedHatInstanceTypeMetadata,
): void => {
  const { control, setValue } = useVMWizardForm();
  const compute = useWatch({ control, name: 'instanceType.compute' });
  const { isFamilyVisible, loaded } = useDisabledInstanceTypeFamilies(cluster);

  useEffect(() => {
    if (!loaded || (compute && compute.type !== 'redhat')) {
      return;
    }

    const selectedSeries = (compute as { series: string })?.series;
    const needsReplacement = !selectedSeries || !isFamilyVisible(selectedSeries);

    if (!needsReplacement) {
      return;
    }

    const defaultSeries = pickDefaultRedHatInstanceTypeSeries(
      redHatMenuItems?.items ?? [],
      isFamilyVisible,
    );

    setValue(
      'instanceType.compute',
      defaultSeries ? getDefaultRedHatComputeSelection(defaultSeries) : null,
      { shouldValidate: true },
    );
  }, [compute, isFamilyVisible, loaded, redHatMenuItems, setValue]);
};

export default useEnsureAvailableRedHatComputeSelection;
