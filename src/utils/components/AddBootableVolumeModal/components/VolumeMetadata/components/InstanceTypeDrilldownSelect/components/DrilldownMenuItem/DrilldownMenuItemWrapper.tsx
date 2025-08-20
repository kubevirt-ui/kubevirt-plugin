import React, { FC, useState } from 'react';

import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import HugepagesCheckbox from '@kubevirt-utils/components/HugepagesCheckbox/HugepagesCheckbox';

import { instanceTypeSeriesNameMapper } from '../../utils/constants';
import { RedHatInstanceTypeSeries } from '../../utils/types';
import {
  getOppositeHugepagesInstanceType,
  is1GiInstanceType,
  seriesHasHugepagesVariant,
} from '../../utils/utils';
import RedHatInstanceTypeSeriesSizesMenuItems from '../RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItem';

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
  const { classAnnotation, seriesName, sizes } = series;
  const { disabled, Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const isSelectedFromSeries =
    selectedKind === VirtualMachineClusterInstancetypeModel.kind && selected.startsWith(seriesName);

  const [isHugepages, setIsHugepages] = useState(
    isSelectedFromSeries && is1GiInstanceType(selected),
  );

  return disabled ? null : (
    <DrilldownMenuItem
      Icon={Icon && Icon}
      id={seriesName}
      key={seriesName}
      label={seriesLabel || classAnnotation}
    >
      {seriesHasHugepagesVariant(seriesName) && (
        <HugepagesCheckbox
          onHugepagesChange={(_, checked) => {
            setIsHugepages(checked);
            if (isSelectedFromSeries) {
              onSelect(getOppositeHugepagesInstanceType(selected, checked), true);
            }
          }}
          id={`${seriesName}-drilldown`}
          isHugepages={isHugepages}
          isInDrilldownMenu
        />
      )}
      <RedHatInstanceTypeSeriesSizesMenuItems
        isHugepages={isHugepages}
        onSelect={onSelect}
        selected={selected}
        seriesName={seriesName}
        sizes={sizes}
      />
    </DrilldownMenuItem>
  );
};

export default DrilldownMenuItemWrapper;
