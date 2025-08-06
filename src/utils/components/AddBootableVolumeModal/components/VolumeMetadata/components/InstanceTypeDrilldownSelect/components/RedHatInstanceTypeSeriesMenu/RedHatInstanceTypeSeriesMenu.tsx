import React, { FC } from 'react';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItem from '../DrilldownMenuItem/DrilldownMenuItem';

import RedHatInstanceTypeSeriesSizesMenuItems from './RedHatInstanceTypeSeriesSizesMenuItem';

type RedHatInstanceTypeSeriesMenuProps = {
  selected: string;
  selectedKind: string;
  series: RedHatInstanceTypeSeries[];
  setSelected: (value: string) => void;
};

const RedHatInstanceTypeSeriesMenu: FC<RedHatInstanceTypeSeriesMenuProps> = ({
  series,
  ...restProps
}) => (
  <>
    {series.map(({ classAnnotation, seriesName, sizes }) => {
      const { disabled, Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};
      return (
        !disabled && (
          <DrilldownMenuItem
            Icon={Icon && Icon}
            id={seriesName}
            key={seriesName}
            label={seriesLabel || classAnnotation}
          >
            <RedHatInstanceTypeSeriesSizesMenuItems
              seriesName={seriesName}
              sizes={sizes}
              {...restProps}
            />
          </DrilldownMenuItem>
        )
      );
    })}
  </>
);

export default RedHatInstanceTypeSeriesMenu;
