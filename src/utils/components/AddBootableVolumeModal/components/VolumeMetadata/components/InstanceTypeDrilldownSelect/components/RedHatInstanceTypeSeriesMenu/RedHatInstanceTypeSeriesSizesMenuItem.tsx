import React, { Dispatch, FC, SetStateAction } from 'react';

import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { MenuItem } from '@patternfly/react-core';

import { InstanceTypeSize } from '../../utils/types';

type RedHatInstanceTypeSeriesSizesMenuItemProps = {
  selected: string;
  selectedKind?: string;
  seriesName: string;
  setSelected: Dispatch<SetStateAction<string>>;
  sizes: InstanceTypeSize[];
};

const RedHatInstanceTypeSeriesSizesMenuItems: FC<RedHatInstanceTypeSeriesSizesMenuItemProps> = ({
  selected,
  selectedKind = VirtualMachineClusterInstancetypeModel.kind,
  seriesName,
  setSelected,
  sizes,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {sizes.map(({ cpus, memory, sizeLabel }) => {
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
            onClick={() => setSelected(itName)}
          >
            {itLabel}
          </MenuItem>
        );
      })}
    </>
  );
};

export default RedHatInstanceTypeSeriesSizesMenuItems;
