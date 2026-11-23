import React, { type FC, useMemo, useState } from 'react';
import classNames from 'classnames';

import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { getSeriesLabel } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { getFamilySelectorVisibilityStatus } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeSeries } from '@kubevirt-utils/resources/instancetype/types';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Card,
  Flex,
  Switch,
} from '@patternfly/react-core';

import './family-availability-card.scss';

type FamilyAvailabilityCardProps = {
  isAvailable: boolean;
  seriesItem: RedHatInstanceTypeSeries;
  setFamilyAvailable: (series: InstanceTypeSeries, available: boolean) => Promise<void>;
};

const FamilyAvailabilityCard: FC<FamilyAvailabilityCardProps> = ({
  isAvailable,
  seriesItem,
  setFamilyAvailable,
}) => {
  const { t } = useKubevirtTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | undefined>();
  const { classDisplayNameAnnotation, seriesName } = seriesItem;
  const seriesConfig = instanceTypeSeriesNameMapper[seriesName as InstanceTypeSeries];
  const Icon = seriesConfig?.Icon;
  const seriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);
  const { label: visibilityLabel } = getFamilySelectorVisibilityStatus(isAvailable, t);

  const handleAvailabilityChange = async (_event: unknown, checked: boolean): Promise<void> => {
    setIsUpdating(true);
    setUpdateError(undefined);
    try {
      await setFamilyAvailable(seriesName as InstanceTypeSeries, checked);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsUpdating(false);
    }
  };

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
        <Switch
          aria-label={t('Toggle availability for {{family}}', {
            family: classDisplayNameAnnotation,
          })}
          className="family-availability-card__switch"
          data-test={`family-availability-toggle-${seriesName}`}
          isChecked={isAvailable}
          isDisabled={isUpdating}
          label={visibilityLabel}
          onChange={(_event, checked) => void handleAvailabilityChange(_event, checked)}
        />
        {updateError !== undefined && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={() => setUpdateError(undefined)} />}
            className="family-availability-card__error"
            data-test={`family-availability-error-${seriesName}`}
            isInline
            isPlain
            title={t('Failed to update family availability')}
            variant={AlertVariant.danger}
          >
            {updateError}
          </Alert>
        )}
      </Flex>
    </Card>
  );
};

export default FamilyAvailabilityCard;
