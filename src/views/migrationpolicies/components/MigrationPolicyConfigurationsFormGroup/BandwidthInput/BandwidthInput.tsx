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

import { fromIECUnit } from '../../MigrationPolicyEditModal/utils/utils';

type BandwidthInputProps = {
  bandwidth: {
    value: number;
    unit: BinaryUnit;
  };
  setBandwidth: React.Dispatch<
    React.SetStateAction<{
      value: number;
      unit: BinaryUnit;
    }>
  >;
};

const unitOptions = [BinaryUnit.Ki, BinaryUnit.Mi, BinaryUnit.Gi];

const BandwidthInput: React.FC<BandwidthInputProps> = ({ bandwidth, setBandwidth }) => {
  const { t } = useKubevirtTranslation();
  const [isQuantitySelectOpen, setIsQuantitySelectOpen] = useState<boolean>(false);

  const onSelectUnit = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
      newUnit: BinaryUnit,
    ) => {
      setBandwidth((prev) => ({ ...prev, unit: fromIECUnit(newUnit) }));
      setIsQuantitySelectOpen(false);
    },
    [setBandwidth],
  );

  return (
    <Split hasGutter>
      <SplitItem>
        <NumberInput
          min={0}
          value={bandwidth?.value}
          onMinus={() => setBandwidth((prev) => ({ ...prev, value: --prev.value }))}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            +event.target.value >= 0 &&
            setBandwidth((prev) => ({ ...prev, value: +event.target.value }))
          }
          onPlus={() => setBandwidth((prev) => ({ ...prev, value: ++prev.value }))}
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
          selections={toIECUnit(bandwidth?.unit)}
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
