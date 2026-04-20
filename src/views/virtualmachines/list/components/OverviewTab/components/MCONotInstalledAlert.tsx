import React, { FCC, useState } from 'react';

import { getMCONotInstalledTooltip } from '@kubevirt-utils/hooks/useAlerts/utils/useMCOInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

const MCONotInstalledAlert: FCC = () => {
  const { t } = useKubevirtTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={() => setDismissed(true)} />}
      isInline
      title={getMCONotInstalledTooltip(t)}
      variant={AlertVariant.warning}
    />
  );
};

export default MCONotInstalledAlert;
