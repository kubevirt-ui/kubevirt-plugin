import { type FC, useMemo } from 'react';

import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { INSTANCE_TYPE_SERIES } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/constants';
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

import './family-availability-section.scss';

const FAMILY_AVAILABILITY_SECTION_ID = 'family-availability-section';

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
  const isSingleClusterRoute = Boolean(cluster) && !showClusterSelector;
  const isReadOnly = !canEdit;
  const permissionDeniedMessage = t(
    'You do not have permission to change instance type family availability on cluster {{cluster}}.',
    { cluster },
  );

  const familyAvailabilityHelpText = showClusterSelector
    ? t(
        'Hide instance type families that the selected cluster cannot run. VM creators will not see unavailable families in pickers.',
      )
    : t(
        'Hide instance type families that this cluster cannot run. VM creators will not see unavailable families in pickers.',
      );

  if (!canEdit && !showClusterSelector) {
    return null;
  }

  const summaryBadgeText =
    showClusterSelector && cluster
      ? t('{{available}} / {{total}} available on {{cluster}}', {
          available: availableCount,
          cluster,
          total: totalFamilies,
        })
      : t('{{available}} / {{total}} available', {
          available: availableCount,
          total: totalFamilies,
        });

  return (
    <ExpandSectionWithCustomToggle
      className="family-availability-section"
      expandSectionClassName="family-availability-section__content"
      helpTextBesideToggle
      helpTextContent={familyAvailabilityHelpText}
      id={FAMILY_AVAILABILITY_SECTION_ID}
      isIndented
      toggleClassname="ExpandSection"
      toggleContent={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <span>{t('Family availability')}</span>
          {isSingleClusterRoute && (
            <Label data-test="family-availability-cluster-label" isCompact>
              {t('Cluster: {{clusterName}}', { clusterName: cluster })}
            </Label>
          )}
          {showAvailabilitySummaryBadge && (
            <Label className="family-availability-section__summary-badge" color="orange" isCompact>
              {summaryBadgeText}
            </Label>
          )}
        </Flex>
      }
    >
      {showClusterSelector && (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          className="pf-v6-u-mb-md"
          data-test="family-availability-cluster-selector"
          gap={{ default: 'gapSm' }}
        >
          {t('Cluster')}:
          <ClusterDropdown
            includeAllClusters={false}
            onChange={onClusterChange}
            selectedCluster={selectedCluster ?? ''}
          />
        </Flex>
      )}
      <p className="pf-v6-u-text-color-subtle pf-v6-u-mb-md">{familyAvailabilityHelpText}</p>
      {isClusterResolved && canEditLoaded && isReadOnly && (
        <Alert
          className="pf-v6-u-mb-md"
          isInline
          isPlain
          title={permissionDeniedMessage}
          variant={AlertVariant.info}
        />
      )}
      <Gallery hasGutter key={cluster ?? 'local'} minWidths={{ default: '12.5rem' }}>
        {isLoaded
          ? seriesItems.map((seriesItem) => {
              const seriesName = seriesItem.seriesName as InstanceTypeSeriesName;
              const isAvailable = !disabledFamilies.has(seriesName);
              return (
                <GalleryItem key={seriesName}>
                  <FamilyAvailabilityCard
                    cluster={cluster}
                    isAvailable={isAvailable}
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
