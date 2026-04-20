import React, { FCC } from 'react';

import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { Stack, StackItem } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import InstanceTypeSizeMenu from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeMenu';
import RedHatInstanceTypeSeriesGallery from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/RedHatInstanceTypeSeriesGallery';

type RedHatProvidedInstanceTypesSectionProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FCC<RedHatProvidedInstanceTypesSectionProps> = ({
  redHatMenuItems,
}) => {
  const { selectedSeries } = useInstanceTypeVMStore();

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
