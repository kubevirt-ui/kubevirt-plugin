import { type FC, useMemo } from 'react';

import { getVisibleRedHatInstanceTypeSeriesItems } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/getVisibleRedHatInstanceTypeSeriesItems';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';

import type { RedHatInstanceTypeSeries } from '../../utils/types';
import DrilldownMenuItemWrapper from '../DrilldownMenuItem/DrilldownMenuItemWrapper';

type RedHatInstanceTypeSeriesMenuProps = {
  cluster?: string;
  onSelect: (value: string, keepMenuOpen?: boolean) => void;
  selected: string;
  selectedKind: string;
  seriesList: RedHatInstanceTypeSeries[];
};

const RedHatInstanceTypeSeriesMenu: FC<RedHatInstanceTypeSeriesMenuProps> = ({
  cluster,
  onSelect,
  selected,
  selectedKind,
  seriesList,
}) => {
  const { isFamilyVisible, loaded } = useDisabledInstanceTypeFamilies(cluster);
  const preserveFamily = selected ? getInstanceTypePrefix(selected) : undefined;
  const visibleSeriesList = useMemo(() => {
    if (!loaded) {
      return [];
    }
    return getVisibleRedHatInstanceTypeSeriesItems(seriesList, isFamilyVisible, preserveFamily);
  }, [isFamilyVisible, loaded, preserveFamily, seriesList]);

  return (
    <>
      {visibleSeriesList.map((series) => (
        <DrilldownMenuItemWrapper
          key={series.seriesName}
          onSelect={onSelect}
          selected={selected}
          selectedKind={selectedKind}
          series={series}
        />
      ))}
    </>
  );
};

export default RedHatInstanceTypeSeriesMenu;
