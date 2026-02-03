import React, { FC } from 'react';

import RedHatSeriesMenuCard from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';
import useInstanceTypeCardMenuSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/hooks/useInstanceTypeCardMenuSection';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { Flex } from '@patternfly/react-core';

type RedHatProvidedInstanceTypesSectionProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FC<RedHatProvidedInstanceTypesSectionProps> = ({
  redHatMenuItems,
}) => {
  const menuProps = useInstanceTypeCardMenuSection();

  return (
    <Flex
      gap={{ default: 'gapMd', lg: 'gapXl' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
    >
      {redHatMenuItems.items
        .toSorted((a, b) =>
          universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
        )
        .map((rhSeriesItem) => {
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
