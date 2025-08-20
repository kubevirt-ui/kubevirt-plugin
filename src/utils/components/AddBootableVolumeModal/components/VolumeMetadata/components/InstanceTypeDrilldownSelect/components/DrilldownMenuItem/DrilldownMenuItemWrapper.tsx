import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import HugepagesCheckbox from '@kubevirt-utils/components/HugepagesCheckbox/HugepagesCheckbox';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import { seriesHasHugepagesVariant } from '../../utils/utils';
import RedHatInstanceTypeSeriesSizesMenuItems from '../RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItem';

import DrilldownMenuItem from './DrilldownMenuItem';

type DrilldownMenuItemWrapperProps = {
  selected: string;
  series: RedHatInstanceTypeSeries;
  setSelected: Dispatch<SetStateAction<string>>;
};

const DrilldownMenuItemWrapper: FC<DrilldownMenuItemWrapperProps> = ({ series, ...restProps }) => {
  const { classAnnotation, seriesName, sizes } = series;
  const { disabled, Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const [isHugepages, setIsHugepages] = useState(false);

  return disabled ? null : (
    <DrilldownMenuItem
      Icon={Icon && Icon}
      id={seriesName}
      key={seriesName}
      label={seriesLabel || classAnnotation}
    >
      {seriesHasHugepagesVariant(seriesName) && (
        <HugepagesCheckbox
          id={`${seriesName}-drilldown`}
          isHugepages={isHugepages}
          isInDrilldownMenu
          onHugepagesChange={(_, checked) => setIsHugepages(checked)}
        />
      )}
      <RedHatInstanceTypeSeriesSizesMenuItems
        isHugepages={isHugepages}
        seriesName={seriesName}
        sizes={sizes}
        {...restProps}
      />
    </DrilldownMenuItem>
  );
};

export default DrilldownMenuItemWrapper;
