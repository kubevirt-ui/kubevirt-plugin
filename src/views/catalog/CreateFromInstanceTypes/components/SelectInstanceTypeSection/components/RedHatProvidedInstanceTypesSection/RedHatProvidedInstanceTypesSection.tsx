import React, { FC, useMemo } from 'react';

import RedHatSeriesMenuCard from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';
import useInstanceTypeCardMenuSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/hooks/useInstanceTypeCardMenuSection';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { getVisibleRedHatInstanceTypeSeriesItems } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/getVisibleRedHatInstanceTypeSeriesItems';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { Flex } from '@patternfly/react-core';

type RedHatProvidedInstanceTypesSectionProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FC<RedHatProvidedInstanceTypesSectionProps> = ({
  redHatMenuItems,
}) => {
  const menuProps = useInstanceTypeCardMenuSection();
  const selectedInstanceType = useInstanceTypeVMStore(
    (state) => state.instanceTypeVMState.selectedInstanceType,
  );
  const { isFamilyVisible, loaded } = useDisabledInstanceTypeFamilies();

  const selectedInstanceTypeName = selectedInstanceType?.name;
  const preserveFamily = selectedInstanceTypeName
    ? getInstanceTypePrefix(selectedInstanceTypeName)
    : undefined;

  const visibleItems = useMemo(
    () =>
      getVisibleRedHatInstanceTypeSeriesItems(
        redHatMenuItems.items ?? [],
        isFamilyVisible,
        preserveFamily,
      ),
    [isFamilyVisible, preserveFamily, redHatMenuItems.items],
  );

  if (!loaded) {
    return null;
  }

  return (
    <Flex
      gap={{ default: 'gapMd', lg: 'gapXl' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
    >
      {visibleItems.map((rhSeriesItem) => {
        const seriesName = rhSeriesItem?.seriesName;
        return (
          !instanceTypeSeriesNameMapper[seriesName]?.disabled && (
            <RedHatSeriesMenuCard key={seriesName} rhSeriesItem={rhSeriesItem} {...menuProps} />
          )
        );
      })}
    </Flex>
  );
};

export default RedHatProvidedInstanceTypesSection;
