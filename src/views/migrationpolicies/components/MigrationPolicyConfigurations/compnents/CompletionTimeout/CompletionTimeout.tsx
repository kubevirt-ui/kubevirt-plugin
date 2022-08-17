import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput } from '@patternfly/react-core';

type CompletionTimeoutProps = {
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
};

const CompletionTimeout: React.FC<CompletionTimeoutProps> = ({
  state: completionTimeoutInGib,
  setState,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <NumberInput
      data-test-id="migration-policy-completion-timeout-input"
      id="migration-policy-completion-timeout-input"
      value={completionTimeoutInGib}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        +event?.target?.value >= 0 && setState(+event.target.value)
      }
      onPlus={() => setState((prev) => (prev ? prev + 1 : 1))}
      onMinus={() => setState((prev) => --prev)}
      min={0}
      minusBtnAriaLabel={t('Decrement')}
      plusBtnAriaLabel={t('Increment')}
    />
  );
};

export default CompletionTimeout;
