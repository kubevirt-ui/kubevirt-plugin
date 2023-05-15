import React, { Dispatch, FC, SetStateAction } from 'react';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItem from '../DrilldownMenuItem/DrilldownMenuItem';

import RedHatInstanceTypeSeriesSizesMenuItems from './RedHatInstanceTypeSeriesSizesMenuItem';

type RedHatInstanceTypeSeriesMenuProps = {
  series: RedHatInstanceTypeSeries[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
};

const RedHatInstanceTypeSeriesMenu: FC<RedHatInstanceTypeSeriesMenuProps> = ({
  series,
  ...restProps
}) => {
  return (
    <>
      {series.map(({ classAnnotation, seriesName, sizes }) => {
        const { Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};
        return (
          <DrilldownMenuItem
            key={seriesName}
            id={seriesName}
            label={seriesLabel || classAnnotation}
            Icon={Icon && Icon}
          >
            <RedHatInstanceTypeSeriesSizesMenuItems
              seriesName={seriesName}
              sizes={sizes}
              {...restProps}
            />
          </DrilldownMenuItem>
        );
      })}
    </>
  );
};

export default RedHatInstanceTypeSeriesMenu;
