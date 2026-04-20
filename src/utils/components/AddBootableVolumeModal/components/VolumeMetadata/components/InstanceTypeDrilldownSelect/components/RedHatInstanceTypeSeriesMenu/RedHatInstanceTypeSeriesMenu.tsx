import React, { FCC } from 'react';

import { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItemWrapper from '../DrilldownMenuItem/DrilldownMenuItemWrapper';

type RedHatInstanceTypeSeriesMenuProps = {
  onSelect: (value: string, keepMenuOpen?: boolean) => void;
  selected: string;
  selectedKind: string;
  seriesList: RedHatInstanceTypeSeries[];
};

const RedHatInstanceTypeSeriesMenu: FCC<RedHatInstanceTypeSeriesMenuProps> = ({
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
