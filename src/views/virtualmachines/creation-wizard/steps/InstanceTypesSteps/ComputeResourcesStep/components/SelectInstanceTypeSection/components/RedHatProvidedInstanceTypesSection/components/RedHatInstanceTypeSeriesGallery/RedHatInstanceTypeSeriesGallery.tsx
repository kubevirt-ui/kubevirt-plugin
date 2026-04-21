import React, { FC, useMemo } from 'react';

import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import RedHatSeriesMenuCard from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';

type RedHatInstanceTypeSeriesGalleryProps = {
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatInstanceTypeSeriesGallery: FC<RedHatInstanceTypeSeriesGalleryProps> = ({
  redHatMenuItems,
}) => {
  const sortedItems = useMemo(
    () =>
      (redHatMenuItems?.items ?? []).toSorted((a, b) =>
        universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
      ),
    [redHatMenuItems],
  );

  return (
    <Gallery hasGutter>
      {sortedItems?.map((rhSeriesItem) => {
        const seriesName = rhSeriesItem?.seriesName;
        return (
          !instanceTypeSeriesNameMapper[seriesName]?.disabled && (
            <GalleryItem key={seriesName}>
              <RedHatSeriesMenuCard key={seriesName} rhSeriesItem={rhSeriesItem} />
            </GalleryItem>
          )
        );
      })}
    </Gallery>
  );
};

export default RedHatInstanceTypeSeriesGallery;
