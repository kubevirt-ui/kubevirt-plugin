import React, { useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BinaryUnit, toIECUnit } from '@kubevirt-utils/utils/units';
import {
  NumberInput,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { fromIECUnit } from '../../../MigrationPolicyEditModal/utils/utils';

type BandwidthInputProps = {
  state: {
    value: number;
    unit: BinaryUnit;
  };
  setState: React.Dispatch<
    React.SetStateAction<{
      value: number;
      unit: BinaryUnit;
    }>
  >;
};

const unitOptions = [BinaryUnit.Ki, BinaryUnit.Mi, BinaryUnit.Gi];

const BandwidthInput: React.FC<BandwidthInputProps> = ({ state, setState }) => {
  const { t } = useKubevirtTranslation();
  const [isQuantitySelectOpen, setIsQuantitySelectOpen] = useState<boolean>(false);

  const onSelectUnit = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
      newUnit: BinaryUnit,
    ) => {
      setState((prev) => ({ ...prev, unit: fromIECUnit(newUnit) }));
      setIsQuantitySelectOpen(false);
    },
    [setState],
  );

  return (
    <Split hasGutter>
      <SplitItem>
        <NumberInput
          min={0}
          value={state?.value}
          onMinus={() => setState((prev) => ({ ...prev, value: --prev.value }))}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            +event.target.value >= 0 &&
            setState((prev) => ({ ...prev, value: +event.target.value }))
          }
          onPlus={() => setState((prev) => ({ ...prev, value: prev?.value + 1 || 1 }))}
          minusBtnAriaLabel={t('Decrement')}
          plusBtnAriaLabel={t('Increment')}
        />
      </SplitItem>
      <SplitItem>
        <Select
          menuAppendTo="parent"
          isOpen={isQuantitySelectOpen}
          onToggle={setIsQuantitySelectOpen}
          onSelect={onSelectUnit}
          variant={SelectVariant.single}
          selections={toIECUnit(state?.unit)}
        >
          {unitOptions.map((unitOption) => (
            <SelectOption key={unitOption} value={toIECUnit(unitOption)} />
          ))}
        </Select>
      </SplitItem>
    </Split>
  );
};

export default BandwidthInput;
