import React, { FC } from 'react';

import { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItemWrapper from '../DrilldownMenuItem/DrilldownMenuItemWrapper';

type RedHatInstanceTypeSeriesMenuProps = {
  selected: string;
  selectedKind: string;
  seriesList: RedHatInstanceTypeSeries[];
  setSelected: (value: string) => void;
};

const RedHatInstanceTypeSeriesMenu: FC<RedHatInstanceTypeSeriesMenuProps> = ({
  seriesList,
  ...restProps
}) => (
  <>
    {seriesList.map((series) => (
      <DrilldownMenuItemWrapper key={series.seriesName} series={series} {...restProps} />
    ))}
  </>
);

export default RedHatInstanceTypeSeriesMenu;
