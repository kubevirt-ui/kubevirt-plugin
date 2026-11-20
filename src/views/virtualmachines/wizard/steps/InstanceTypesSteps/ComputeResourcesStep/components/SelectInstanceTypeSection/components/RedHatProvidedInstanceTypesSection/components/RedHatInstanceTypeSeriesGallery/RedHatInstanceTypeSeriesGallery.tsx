import type { FC } from 'react';
import { useMemo } from 'react';

import type { RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { getVisibleRedHatInstanceTypeSeriesItems } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/getVisibleRedHatInstanceTypeSeriesItems';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import RedHatInstanceTypesEmptyState from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatInstanceTypesEmptyState/RedHatInstanceTypesEmptyState';
import RedHatSeriesMenuCard from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';

type RedHatInstanceTypeSeriesGalleryProps = {
  cluster?: string;
  preserveFamily?: string;
  redHatMenuItems: RedHatInstanceTypeMetadata;
};

const RedHatInstanceTypeSeriesGallery: FC<RedHatInstanceTypeSeriesGalleryProps> = ({
  cluster,
  preserveFamily,
  redHatMenuItems,
}) => {
  const { canEdit, isFamilyVisible, loaded } = useDisabledInstanceTypeFamilies(cluster);
  const visibleSortedItems = useMemo(
    () =>
      getVisibleRedHatInstanceTypeSeriesItems(
        redHatMenuItems?.items ?? [],
        isFamilyVisible,
        preserveFamily,
      ),
    [isFamilyVisible, preserveFamily, redHatMenuItems],
  );

  if (!loaded) {
    return null;
  }

  if (isEmpty(visibleSortedItems)) {
    return (
      <RedHatInstanceTypesEmptyState
        allFamiliesDisabled={!isEmpty(redHatMenuItems?.items)}
        canEdit={canEdit}
        cluster={cluster}
      />
    );
  }

  return (
    <Gallery hasGutter>
      {visibleSortedItems.map((rhSeriesItem) => (
        <GalleryItem key={rhSeriesItem.seriesName}>
          <RedHatSeriesMenuCard rhSeriesItem={rhSeriesItem} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default RedHatInstanceTypeSeriesGallery;
