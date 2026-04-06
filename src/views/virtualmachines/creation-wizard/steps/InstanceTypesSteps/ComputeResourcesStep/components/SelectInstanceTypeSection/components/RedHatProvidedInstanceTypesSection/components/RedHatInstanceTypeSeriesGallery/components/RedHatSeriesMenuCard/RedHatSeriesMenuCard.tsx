import React, { FC, useMemo } from 'react';
import classNames from 'classnames';

import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import {
  getSeriesLabel,
  getSeriesSymbol,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardHeader, Flex, Tooltip } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import MarkdownTooltipContent from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/MarkdownTooltipContent';

import './RedHatSeriesMenuCard.scss';

type RedHatSeriesMenuCardProps = {
  rhSeriesItem: RedHatInstanceTypeSeries;
};

const RedHatSeriesMenuCard: FC<RedHatSeriesMenuCardProps> = ({ rhSeriesItem }) => {
  const { t } = useKubevirtTranslation();

  const { selectedSeries, setSelectedSeries } = useInstanceTypeVMStore();

  const { classDisplayNameAnnotation, descriptionAnnotation, seriesName } = rhSeriesItem;

  const { Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const isSelectedSeries = useMemo(
    () => seriesName === selectedSeries,
    [selectedSeries, seriesName],
  );

  const defaultSeriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);

  const handleSeriesClick = () => {
    setSelectedSeries(seriesName);
  };

  const card = (
    <Card
      className={classNames(
        'instance-type-series-menu-card__toggle-card',
        isSelectedSeries && 'selected',
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSeriesClick();
        }
      }}
      aria-pressed={isSelectedSeries}
      isCompact
      onClick={handleSeriesClick}
      role="button"
      tabIndex={0}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} direction={{ default: 'column' }}>
        <div className="instance-type-series-menu-card__card-icon">
          {Icon ? <Icon /> : getSeriesSymbol(seriesName)}
        </div>
        <CardHeader className="instance-type-series-menu-card__card-title">
          {classDisplayNameAnnotation}
        </CardHeader>
        <CardBody>
          <div className="instance-type-series-menu-card__series-label">
            {seriesLabel || defaultSeriesLabel}
          </div>
        </CardBody>
      </Flex>
    </Card>
  );

  return (
    <Tooltip content={<MarkdownTooltipContent content={descriptionAnnotation} />}>{card}</Tooltip>
  );
};

export default RedHatSeriesMenuCard;
