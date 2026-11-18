import { type FC, useMemo, useState } from 'react';
import classNames from 'classnames';

import { seriesNameIconMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { getSeriesLabel } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { getFamilySelectorVisibilityStatus } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import { Card, Flex, Switch, Tooltip } from '@patternfly/react-core';

import './family-availability-card.scss';

type FamilyAvailabilityCardProps = {
  cluster?: string;
  isAvailable: boolean;
  isReadOnly?: boolean;
  seriesItem: RedHatInstanceTypeSeries;
  setFamilyAvailable: (series: InstanceTypeSeriesName, available: boolean) => Promise<void>;
};

const FamilyAvailabilityCard: FC<FamilyAvailabilityCardProps> = ({
  cluster,
  isAvailable,
  isReadOnly = false,
  seriesItem,
  setFamilyAvailable,
}) => {
  const { t } = useKubevirtTranslation();
  const { addDangerToast } = useKubevirtToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { classDisplayNameAnnotation, seriesName } = seriesItem;
  const Icon = seriesNameIconMapper[seriesName as InstanceTypeSeriesName];
  const seriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);
  const { label: visibilityLabel } = getFamilySelectorVisibilityStatus(isAvailable, t);

  const handleAvailabilityChange = async (_event: unknown, checked: boolean): Promise<void> => {
    if (isReadOnly) return;
    setIsUpdating(true);
    try {
      await setFamilyAvailable(seriesName as InstanceTypeSeriesName, checked);
    } catch {
      addDangerToast({ title: t('Failed to update family availability') });
    } finally {
      setIsUpdating(false);
    }
  };

  const familySwitch = (
    <Switch
      aria-label={t('Toggle availability for {{family}}', {
        family: classDisplayNameAnnotation,
      })}
      className="family-availability-card__switch"
      data-test={`family-availability-toggle-${seriesName}`}
      isChecked={isAvailable}
      isDisabled={isUpdating || isReadOnly}
      label={visibilityLabel}
      onChange={(_event, checked) => void handleAvailabilityChange(_event, checked)}
    />
  );

  return (
    <Card
      className={classNames('family-availability-card', {
        'family-availability-card--unavailable': !isAvailable,
      })}
      data-test={`family-availability-card-${seriesName}`}
      isCompact
    >
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        className="family-availability-card__content"
        direction={{ default: 'column' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <div className="family-availability-card__icon">{Icon && <Icon />}</div>
        <div className="family-availability-card__title">{classDisplayNameAnnotation}</div>
        <div className="family-availability-card__series-label">{seriesLabel}</div>
        {isReadOnly ? (
          <Tooltip
            content={t(
              'You do not have permission to change instance type family availability on cluster {{cluster}}.',
              { cluster },
            )}
          >
            <span className="family-availability-card__switch-wrapper" tabIndex={0}>
              {familySwitch}
            </span>
          </Tooltip>
        ) : (
          familySwitch
        )}
      </Flex>
    </Card>
  );
};

export default FamilyAvailabilityCard;
