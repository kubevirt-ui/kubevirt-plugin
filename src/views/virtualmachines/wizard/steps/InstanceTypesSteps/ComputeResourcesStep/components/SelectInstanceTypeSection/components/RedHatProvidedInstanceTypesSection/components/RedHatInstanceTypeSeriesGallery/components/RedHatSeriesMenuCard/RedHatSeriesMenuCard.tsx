import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import classNames from 'classnames';

import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import {
  getSeriesLabel,
  getSeriesSymbol,
  is1GiInstanceType,
  seriesHasHugepagesVariant,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeSeries } from '@kubevirt-utils/resources/instancetype/types';
import { Card, CardBody, CardHeader, Flex, Tooltip } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import MarkdownTooltipContent from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/MarkdownTooltipContent';

import './RedHatSeriesMenuCard.scss';

type RedHatSeriesMenuCardProps = {
  rhSeriesItem: RedHatInstanceTypeSeries;
};

const RedHatSeriesMenuCard: FC<RedHatSeriesMenuCardProps> = ({ rhSeriesItem }) => {
  const { t } = useKubevirtTranslation();

  const { control, setValue } = useVMWizard();
  const selectedSeries = useWatch({
    control,
    name: 'instanceType.compute.series',
  }) as string;

  const { classDisplayNameAnnotation, descriptionAnnotation, seriesName, sizes } = rhSeriesItem;

  const seriesConfig = instanceTypeSeriesNameMapper[seriesName as InstanceTypeSeries];
  const Icon = seriesConfig?.Icon;

  const isSelectedSeries = useMemo(
    () => seriesName === selectedSeries,
    [selectedSeries, seriesName],
  );

  const defaultSeriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);

  const handleSeriesClick = (): void => {
    if (seriesName === selectedSeries) {
      return;
    }

    const standardSizes = seriesHasHugepagesVariant(seriesName)
      ? sizes?.filter((size) => !is1GiInstanceType(size.sizeLabel))
      : sizes;
    const defaultSize = (standardSizes?.[0] ?? sizes?.[0])?.sizeLabel;
    setValue('instanceType.compute', {
      name: defaultSize ? `${seriesName}.${defaultSize}` : seriesName,
      series: seriesName,
      size: defaultSize ?? '',
      type: 'redhat',
    });
  };

  const card = (
    <Card
      aria-pressed={isSelectedSeries}
      className={classNames(
        'instance-type-series-menu-card__toggle-card',
        isSelectedSeries && 'selected',
      )}
      data-test={`instance-type-series-${seriesName}`}
      isCompact
      onClick={handleSeriesClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSeriesClick();
        }
      }}
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
          <div className="instance-type-series-menu-card__series-label">{defaultSeriesLabel}</div>
        </CardBody>
      </Flex>
    </Card>
  );

  return (
    <Tooltip content={<MarkdownTooltipContent content={descriptionAnnotation} />}>{card}</Tooltip>
  );
};

export default RedHatSeriesMenuCard;
