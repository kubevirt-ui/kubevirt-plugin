import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Checkbox } from '@patternfly/react-core';

import { deselectVM, isVMSelected, selectVM } from '../selectedVMs';

import { VMCellProps } from './types';

const VMSelectionCell: FCC<VMCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();

  if (!row) return null;

  const selected = isVMSelected(row);
  const name = getName(row);
  const namespace = getNamespace(row);

  return (
    <Checkbox
      aria-label={t('Select virtual machine {{name}} in namespace {{namespace}}', {
        name,
        namespace,
      })}
      data-test={`select-vm-${name}`}
      id={`select-${row?.metadata?.uid ?? `${namespace}-${name}`}`}
      isChecked={selected}
      onChange={() => (selected ? deselectVM(row) : selectVM(row))}
    />
  );
};

export default VMSelectionCell;
