import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, NumberInput, Stack, StackItem } from '@patternfly/react-core';

type CompletionTimeoutInputProps = {
  completionTimeout: {
    enabled: boolean;
    value: number;
  };
  setCompletionTimeout: React.Dispatch<
    React.SetStateAction<{
      enabled: boolean;
      value: number;
    }>
  >;
};

const CompletionTimeoutInput: React.FC<CompletionTimeoutInputProps> = ({
  completionTimeout,
  setCompletionTimeout,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Checkbox
          isChecked={completionTimeout?.enabled}
          onChange={(checked) => setCompletionTimeout((prev) => ({ ...prev, enabled: checked }))}
          label={
            <>
              <span className="pf-c-form__label">{t('Completion timeout')}</span>{' '}
              <span className="pf-c-form__helper-text">{t('(in seconds)')}</span>
            </>
          }
          id="migration-policy-completion-timeout"
          data-test-id="migration-policy-completion-timeout-checkbox"
        />
      </StackItem>
      <StackItem>
        {completionTimeout?.enabled && (
          <NumberInput
            data-test-id="migration-policy-completion-timeout-input"
            id="migration-policy-completion-timeout-input"
            value={completionTimeout?.value}
            onChange={(event: React.FormEvent<HTMLInputElement>) =>
              +event.currentTarget.value >= 0 &&
              setCompletionTimeout((prev) => ({ ...prev, value: +event.currentTarget.value }))
            }
            onPlus={() => setCompletionTimeout((prev) => ({ ...prev, value: ++prev.value }))}
            onMinus={() => setCompletionTimeout((prev) => ({ ...prev, value: --prev.value }))}
            min={0}
            minusBtnAriaLabel={t('Decrement')}
            plusBtnAriaLabel={t('Increment')}
          />
        )}
      </StackItem>
    </Stack>
  );
};

export default CompletionTimeoutInput;
