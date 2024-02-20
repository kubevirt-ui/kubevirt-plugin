import React, { FC } from 'react';

import RedHatSeriesMenuCard from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';
import useInstanceTypeCardMenuSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/hooks/useInstanceTypeCardMenuSection';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { Flex } from '@patternfly/react-core';

type RedHatProvidedInstanceTypesSectionProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatProvidedInstanceTypesSection: FC<RedHatProvidedInstanceTypesSectionProps> = ({
  redHatMenuItems,
}) => {
  const menuProps = useInstanceTypeCardMenuSection();

  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      {redHatMenuItems.items.map((rhSeriesItem) => {
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
