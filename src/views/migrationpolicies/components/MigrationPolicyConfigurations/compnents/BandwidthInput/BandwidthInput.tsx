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
  setState: React.Dispatch<
    React.SetStateAction<{
      unit: BinaryUnit;
      value: number;
    }>
  >;
  state: {
    unit: BinaryUnit;
    value: number;
  };
};

const unitOptions = [BinaryUnit.Ki, BinaryUnit.Mi, BinaryUnit.Gi];

const BandwidthInput: React.FC<BandwidthInputProps> = ({ setState, state }) => {
  const { t } = useKubevirtTranslation();
  const [isQuantitySelectOpen, setIsQuantitySelectOpen] = useState<boolean>(false);

  const onSelectUnit = useCallback(
    (
      event: React.ChangeEvent<Element> | React.MouseEvent<Element, MouseEvent>,
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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            +event.target.value >= 0 &&
            setState((prev) => ({ ...prev, value: +event.target.value }))
          }
          min={0}
          minusBtnAriaLabel={t('Decrement')}
          onMinus={() => setState((prev) => ({ ...prev, value: --prev.value }))}
          onPlus={() => setState((prev) => ({ ...prev, value: prev?.value + 1 || 1 }))}
          plusBtnAriaLabel={t('Increment')}
          value={state?.value}
        />
      </SplitItem>
      <SplitItem>
        <Select
          isOpen={isQuantitySelectOpen}
          menuAppendTo="parent"
          onSelect={onSelectUnit}
          onToggle={setIsQuantitySelectOpen}
          selections={toIECUnit(state?.unit)}
          variant={SelectVariant.single}
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
