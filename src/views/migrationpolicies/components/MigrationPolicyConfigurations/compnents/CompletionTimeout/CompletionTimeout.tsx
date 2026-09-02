import React, { type ChangeEvent, type Dispatch, type FC, type SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput } from '@patternfly/react-core';

type CompletionTimeoutProps = {
  setState: Dispatch<SetStateAction<number>>;
  state: number;
};

const CompletionTimeout: FC<CompletionTimeoutProps> = ({
  setState,
  state: completionTimeoutInGib,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <NumberInput
      id="migration-policy-completion-timeout-input"
      min={0}
      minusBtnAriaLabel={t('Decrement')}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        +event?.target?.value >= 0 && setState(+event.target.value)
      }
      onMinus={() => setState((prev) => prev - 1)}
      onPlus={() => setState((prev) => (prev ? prev + 1 : 1))}
      plusBtnAriaLabel={t('Increment')}
      value={completionTimeoutInGib}
    />
  );
};

export default CompletionTimeout;
