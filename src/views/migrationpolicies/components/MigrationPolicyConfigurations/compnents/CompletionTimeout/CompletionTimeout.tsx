import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput } from '@patternfly/react-core';

type CompletionTimeoutProps = {
  setState: React.Dispatch<React.SetStateAction<number>>;
  state: number;
};

const CompletionTimeout: React.FC<CompletionTimeoutProps> = ({
  setState,
  state: completionTimeoutInGib,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <NumberInput
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        +event?.target?.value >= 0 && setState(+event.target.value)
      }
      data-test-id="migration-policy-completion-timeout-input"
      id="migration-policy-completion-timeout-input"
      min={0}
      minusBtnAriaLabel={t('Decrement')}
      onMinus={() => setState((prev) => --prev)}
      onPlus={() => setState((prev) => (prev ? prev + 1 : 1))}
      plusBtnAriaLabel={t('Increment')}
      value={completionTimeoutInGib}
    />
  );
};

export default CompletionTimeout;
