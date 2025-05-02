import React, { FC, useEffect, useState } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput, Split, SplitItem } from '@patternfly/react-core';

import { updateDeschedulerValue } from '../../utils/deschedulerAPI';

type DeschedulingIntervalProps = {
  initialInterval: number;
};

const DeschedulingInterval: FC<DeschedulingIntervalProps> = ({ initialInterval }) => {
  const [interval, setInterval] = useState<number>(initialInterval);

  useEffect(() => {
    updateDeschedulerValue('/spec/deschedulingIntervalSeconds', +interval);
  }, [interval]);

  const onMinus = () => {
    const newValue = (interval || 0) - 1;
    setInterval(newValue);
  };

  const onPlus = () => {
    const newValue = (interval || 0) + 1;
    setInterval(newValue);
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setInterval(+value === 0 ? 1 : +value);
  };

  return (
    <Split>
      <SplitItem isFilled>{t('Descheduling interval in seconds')}</SplitItem>
      <SplitItem>
        <NumberInput
          inputAriaLabel={t('Descheduling interval number input')}
          min={1}
          minusBtnAriaLabel={t('minus')}
          onChange={onChange}
          onMinus={onMinus}
          onPlus={onPlus}
          plusBtnAriaLabel={t('plus')}
          value={interval}
        />
      </SplitItem>
    </Split>
  );
};

export default DeschedulingInterval;
