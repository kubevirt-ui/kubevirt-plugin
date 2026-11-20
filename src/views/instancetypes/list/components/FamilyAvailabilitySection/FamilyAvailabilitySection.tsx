import { type FC, useMemo } from 'react';

import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import {
  FAMILY_AVAILABILITY_SECTION_ID,
  INSTANCE_TYPE_SERIES,
} from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/constants';
import { getAllInstanceTypeFamiliesDisabledWarning } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Flex,
  Gallery,
  GalleryItem,
  Label,
  Skeleton,
} from '@patternfly/react-core';

import useFamilyAvailabilityCluster from '../../hooks/useFamilyAvailabilityCluster';
import FamilyAvailabilityCard from './components/FamilyAvailabilityCard';
import FamilyAvailabilityClusterSelector from './components/FamilyAvailabilityClusterSelector';
import {
  getFamilyAvailabilityHelpText,
  getFamilyAvailabilityPermissionDeniedMessage,
  getFamilyAvailabilitySummaryBadgeText,
} from './utils/utils';

import './family-availability-section.scss';

const FamilyAvailabilitySection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, onClusterChange, selectedCluster, showClusterSelector } =
    useFamilyAvailabilityCluster();
  const [instanceTypes, loaded] = useClusterInstanceTypes(undefined, undefined, cluster);
  const {
    canEdit,
    canEditLoaded,
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
  const isClusterResolved = !showClusterSelector || Boolean(cluster);
  const isLoaded = isClusterResolved && loaded && familiesLoaded;
  const isReadOnly = !canEdit;
  const allFamiliesDisabled = familiesLoaded && availableCount === 0;
  const familyAvailabilityHelpText = getFamilyAvailabilityHelpText(t, showClusterSelector);

  if (!canEdit && !showClusterSelector) {
    return null;
  }

  return (
    <ExpandSectionWithCustomToggle
      className="family-availability-section"
      expandSectionClassName="family-availability-section__content"
      helpTextBesideToggle
      helpTextContent={familyAvailabilityHelpText}
      id={FAMILY_AVAILABILITY_SECTION_ID}
      isIndented
      searchItemId={FAMILY_AVAILABILITY_SECTION_ID}
      toggleClassname="ExpandSection"
      toggleContent={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <span>{t('Family availability')}</span>
          {showAvailabilitySummaryBadge && (
            <Label className="family-availability-section__summary-badge" color="orange" isCompact>
              {getFamilyAvailabilitySummaryBadgeText(t, {
                availableCount,
                cluster,
                showClusterSelector,
                totalFamilies,
              })}
            </Label>
          )}
        </Flex>
      }
    >
      {showClusterSelector && (
        <FamilyAvailabilityClusterSelector
          onClusterChange={onClusterChange}
          selectedCluster={selectedCluster}
        />
      )}
      <p className="pf-v6-u-text-color-subtle pf-v6-u-mb-md">{familyAvailabilityHelpText}</p>
      {isClusterResolved && canEditLoaded && isReadOnly && (
        <Alert
          className="pf-v6-u-mb-md"
          isInline
          isPlain
          title={getFamilyAvailabilityPermissionDeniedMessage(t, cluster)}
          variant={AlertVariant.info}
        />
      )}
      {allFamiliesDisabled && (
        <Alert
          className="pf-v6-u-mb-md"
          data-test="all-instance-type-families-disabled-alert"
          isInline
          title={getAllInstanceTypeFamiliesDisabledWarning(t)}
          variant={AlertVariant.warning}
        />
      )}
      <Gallery hasGutter key={cluster ?? 'local'} minWidths={{ default: '12.5rem' }}>
        {isLoaded
          ? seriesItems.map((seriesItem) => {
              const seriesName = seriesItem.seriesName as InstanceTypeSeriesName;
              return (
                <GalleryItem key={seriesName}>
                  <FamilyAvailabilityCard
                    cluster={cluster}
                    isAvailable={!disabledFamilies.has(seriesName)}
                    isReadOnly={isReadOnly}
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
