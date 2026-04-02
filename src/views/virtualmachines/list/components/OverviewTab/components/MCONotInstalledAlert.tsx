import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

const MCONotInstalledAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      title={t(
        'Multicluster observability is not available. Install it on the hub cluster to enable monitoring across clusters.',
      )}
      actionClose={<AlertActionCloseButton onClose={() => setDismissed(true)} />}
      isInline
      variant={AlertVariant.warning}
    />
  );
};

export default MCONotInstalledAlert;
