import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';

const ConsoleForbiddenState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState>
      <EmptyStateBody>
        {t(
          "You don't have permission to access this VirtualMachine's console. Contact your administrator to request access.",
        )}
      </EmptyStateBody>
    </EmptyState>
  );
};

export default ConsoleForbiddenState;
