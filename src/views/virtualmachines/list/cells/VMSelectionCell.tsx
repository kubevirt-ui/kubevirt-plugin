import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Checkbox } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { deselectVM, isVMSelected, selectVM } from '../selectedVMs';

import { type VMCellProps } from './types';

const VMSelectionCell: FC<VMCellProps> = ({ row }) => {
  useSignals();
  const { t } = useKubevirtTranslation();

  if (!row) return null;

  const selected = isVMSelected(row);
  const name = getName(row);
  const namespace = getNamespace(row);
  const checkboxId = row?.metadata?.uid ?? `${namespace}-${name}`;

  return (
    <Checkbox
      aria-label={t('Select virtual machine {{name}} in namespace {{namespace}}', {
        name,
        namespace,
      })}
      data-test={`select-vm-${name}`}
      id={`select-${checkboxId}`}
      isChecked={selected}
      onChange={() => (selected ? deselectVM(row) : selectVM(row))}
    />
  );
};

export default VMSelectionCell;
