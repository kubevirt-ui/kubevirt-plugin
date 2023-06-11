import React, { Dispatch, FC, SetStateAction } from 'react';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItem from '../DrilldownMenuItem/DrilldownMenuItem';

import RedHatInstanceTypeSeriesSizesMenuItems from './RedHatInstanceTypeSeriesSizesMenuItem';

type RedHatInstanceTypeSeriesMenuProps = {
  selected: string;
  series: RedHatInstanceTypeSeries[];
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
        );
      })}
    </>
  );
};

export default RedHatInstanceTypeSeriesMenu;
