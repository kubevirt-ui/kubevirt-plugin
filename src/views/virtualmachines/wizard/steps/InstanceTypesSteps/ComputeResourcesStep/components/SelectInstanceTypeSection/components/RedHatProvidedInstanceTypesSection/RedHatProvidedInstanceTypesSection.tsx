import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import type { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import InstanceTypeSizeMenu from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeMenu';
import RedHatInstanceTypeSeriesGallery from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/RedHatInstanceTypeSeriesGallery';
import useEnsureAvailableRedHatComputeSelection from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/hooks/useEnsureAvailableRedHatComputeSelection';

type RedHatProvidedInstanceTypesSectionProps = {
  cluster?: string;
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FC<RedHatProvidedInstanceTypesSectionProps> = ({
  cluster,
  redHatMenuItems,
}) => {
  const { control } = useVMWizardForm();
  const selectedSeries = useWatch({ control, name: 'instanceType.compute.series' });

  useEnsureAvailableRedHatComputeSelection(cluster);

  const sizes = redHatMenuItems?.items?.find((item) => item?.seriesName === selectedSeries)?.sizes;

  return (
    <Stack hasGutter>
      <StackItem>
        <RedHatInstanceTypeSeriesGallery
          cluster={cluster}
          preserveFamily={selectedSeries}
          redHatMenuItems={redHatMenuItems}
        />
      </StackItem>
      <StackItem>
        <InstanceTypeSizeMenu instanceTypeSizes={sizes} />
      </StackItem>
    </Stack>
  );
};

export default RedHatProvidedInstanceTypesSection;
