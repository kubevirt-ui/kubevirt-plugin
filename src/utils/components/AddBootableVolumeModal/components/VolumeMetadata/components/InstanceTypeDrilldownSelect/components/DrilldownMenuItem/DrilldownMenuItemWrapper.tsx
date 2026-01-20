import React, { FC, useMemo } from 'react';

import HugepagesInfo from '@kubevirt-utils/components/HugepagesInfo/HugepagesInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider } from '@patternfly/react-core';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import { getSeriesLabel, seriesHasHugepagesVariant } from '../../utils/utils';
import RedHatInstanceTypeSeriesSizesMenuItems from '../RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItems';

import DrilldownMenuItem from './DrilldownMenuItem';

type DrilldownMenuItemWrapperProps = {
  onSelect: (value: string, keepMenuOpen?: boolean) => void;
  selected: string;
  selectedKind: string;
  series: RedHatInstanceTypeSeries;
};

const DrilldownMenuItemWrapper: FC<DrilldownMenuItemWrapperProps> = ({
  onSelect,
  selected,
  selectedKind,
  series,
}) => {
  const { t } = useKubevirtTranslation();
  const { seriesName, sizes } = series;
  const { disabled, Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const defaultSeriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);

  const getMenuItems = (isHugepages?: boolean) => (
    <RedHatInstanceTypeSeriesSizesMenuItems
      isHugepages={isHugepages}
      onSelect={onSelect}
      selected={selected}
      selectedKind={selectedKind}
      seriesName={seriesName}
      sizes={sizes}
    />
  );

  return disabled ? null : (
    <DrilldownMenuItem
      Icon={Icon && Icon}
      id={seriesName}
      key={seriesName}
      label={seriesLabel || defaultSeriesLabel}
    >
      {seriesHasHugepagesVariant(seriesName) ? (
        <>
          <DrilldownMenuItem id={`${seriesName}-hugepages`} label={<HugepagesInfo />}>
            {getMenuItems(true)}
          </DrilldownMenuItem>
          <Divider component="li" />
          {getMenuItems(false)}
        </>
      ) : (
        getMenuItems()
      )}
    </DrilldownMenuItem>
  );
};

export default DrilldownMenuItemWrapper;
