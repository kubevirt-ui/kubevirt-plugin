import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import InstanceTypeSizeMenu from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeMenu';
import RedHatInstanceTypeSeriesGallery from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/RedHatInstanceTypeSeriesGallery';

type RedHatProvidedInstanceTypesSectionProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FC<RedHatProvidedInstanceTypesSectionProps> = ({
  redHatMenuItems,
}) => {
  const { control } = useVMWizard();
  const selectedSeries = useWatch({ control, name: 'instanceTypeData.selectedSeries' });

  const sizes = redHatMenuItems?.items?.find((item) => item?.seriesName === selectedSeries)?.sizes;

  return (
    <Stack hasGutter>
      <StackItem>
        <RedHatInstanceTypeSeriesGallery redHatMenuItems={redHatMenuItems} />
      </StackItem>
      <StackItem>
        <InstanceTypeSizeMenu instanceTypeSizes={sizes} />
      </StackItem>
    </Stack>
  );
};

export default RedHatProvidedInstanceTypesSection;
