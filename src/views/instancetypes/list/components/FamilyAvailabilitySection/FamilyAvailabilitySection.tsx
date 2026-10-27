import { type FC, useMemo } from 'react';

import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { INSTANCE_TYPE_SERIES } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/constants';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import {
  Flex,
  Gallery,
  GalleryItem,
  Label,
  PopoverPosition,
  Skeleton,
} from '@patternfly/react-core';

import FamilyAvailabilityCard from './components/FamilyAvailabilityCard';

import './family-availability-section.scss';

const FAMILY_AVAILABILITY_SECTION_ID = 'family-availability-section';

const FamilyAvailabilitySection: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [instanceTypes, loaded] = useClusterInstanceTypes(undefined, undefined, cluster);
  const {
    canEdit,
    disabledFamilies,
    loaded: familiesLoaded,
    setFamilyAvailable,
  } = useDisabledInstanceTypeFamilies(cluster);

  const seriesItems = useMemo(() => {
    const menuItems = getInstanceTypeMenuItems(instanceTypes ?? []);
    return (menuItems.redHatProvided.items ?? []).toSorted((a, b) =>
      universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
    );
  }, [instanceTypes]);

  const totalFamilies = INSTANCE_TYPE_SERIES.length;
  const availableCount = totalFamilies - disabledFamilies.size;
  const showAvailabilitySummaryBadge = familiesLoaded && availableCount < totalFamilies;
  const isLoaded = loaded && familiesLoaded;

  const familyAvailabilityHelpText = t(
    'Hide instance type families that this cluster cannot run. VM creators will not see unavailable families in pickers.',
  );

  if (!canEdit) {
    return null;
  }

  return (
    <ExpandSectionWithCustomToggle
      className="family-availability-section"
      expandSectionClassName="family-availability-section__content"
      id={FAMILY_AVAILABILITY_SECTION_ID}
      isIndented
      toggleClassname="ExpandSection"
      toggleContent={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <span>{t('Family availability')}</span>
          {showAvailabilitySummaryBadge && (
            <Label className="family-availability-section__summary-badge" color="orange" isCompact>
              {t('{{available}} / {{total}} available', {
                available: availableCount,
                total: totalFamilies,
              })}
            </Label>
          )}
          <HelpTextIcon bodyContent={familyAvailabilityHelpText} position={PopoverPosition.right} />
        </Flex>
      }
    >
      <p className="pf-v6-u-text-color-subtle pf-v6-u-mb-md">{familyAvailabilityHelpText}</p>
      <Gallery hasGutter minWidths={{ default: '12.5rem' }}>
        {isLoaded
          ? seriesItems.map((seriesItem) => {
              const seriesName = seriesItem.seriesName as InstanceTypeSeriesName;
              const isAvailable = !disabledFamilies.has(seriesName);
              return (
                <GalleryItem key={seriesName}>
                  <FamilyAvailabilityCard
                    isAvailable={isAvailable}
                    seriesItem={seriesItem}
                    setFamilyAvailable={setFamilyAvailable}
                  />
                </GalleryItem>
              );
            })
          : INSTANCE_TYPE_SERIES.map((seriesName) => (
              <GalleryItem key={seriesName}>
                <Skeleton height="12.5rem" />
              </GalleryItem>
            ))}
      </Gallery>
    </ExpandSectionWithCustomToggle>
  );
};

export default FamilyAvailabilitySection;
