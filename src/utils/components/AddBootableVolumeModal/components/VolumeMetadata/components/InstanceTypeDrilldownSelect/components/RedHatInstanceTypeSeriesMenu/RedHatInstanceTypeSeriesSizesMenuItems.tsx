import React, { FC, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { MenuItem } from '@patternfly/react-core';

import { InstanceTypeSize } from '../../utils/types';
import { is1GiInstanceType, seriesHasHugepagesVariant } from '../../utils/utils';

type RedHatInstanceTypeSeriesSizesMenuItemProps = {
  isHugepages?: boolean;
  onSelect: (value: string) => void;
  selected: string;
  selectedKind?: string;
  seriesName: string;
  sizes: InstanceTypeSize[];
};

const RedHatInstanceTypeSeriesSizesMenuItems: FC<RedHatInstanceTypeSeriesSizesMenuItemProps> = ({
  isHugepages,
  onSelect,
  selected,
  selectedKind = VirtualMachineClusterInstancetypeModel.kind,
  seriesName,
  sizes,
}) => {
  const { t } = useKubevirtTranslation();

  const filteredSizes = useMemo(() => {
    if (!seriesHasHugepagesVariant(seriesName)) {
      return sizes;
    }

    return sizes.filter((size) =>
      isHugepages ? is1GiInstanceType(size.sizeLabel) : !is1GiInstanceType(size.sizeLabel),
    );
  }, [sizes, isHugepages, seriesName]);

  return (
    <>
      {filteredSizes.map(({ cpus, memory, sizeLabel }) => {
        const itName = `${seriesName}.${sizeLabel}`;
        const itLabel = t('{{sizeLabel}}: {{cpus}} CPUs, {{memory}} Memory', {
          cpus,
          memory: readableSizeUnit(memory),
          sizeLabel,
        });

        return (
          <MenuItem
            isSelected={
              selected === itName && selectedKind === VirtualMachineClusterInstancetypeModel.kind
            }
            itemId={itName}
            key={itName}
            onClick={() => onSelect(itName)}
          >
            {itLabel}
          </MenuItem>
        );
      })}
    </>
  );
};

export default RedHatInstanceTypeSeriesSizesMenuItems;
