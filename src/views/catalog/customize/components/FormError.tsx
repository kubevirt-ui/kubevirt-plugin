import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, StackItem } from '@patternfly/react-core';

type FormErrorProps = {
  error?: Error;
};

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  const { t } = useKubevirtTranslation();

  if (!error?.message) return null;

  return (
    <StackItem>
      <Alert variant="danger" title={t('Create VirtualMachine error')} isInline>
        {error.message}
      </Alert>
    </StackItem>
  );
};
