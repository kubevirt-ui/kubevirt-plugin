import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';

type SupportedVolumesAlertProps = {
  isVMRunning?: boolean;
};

const SupportedVolumesAlert: React.FC<SupportedVolumesAlertProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();

  if (!isVMRunning) {
    return null;
  }
  return (
    <FormGroup fieldId="snapshot-info-alerts">
      <Alert
        title={
          <Stack hasGutter>
            <StackItem>{t('Taking snapshot of running VirtualMachine.')}</StackItem>
          </Stack>
        }
        isInline
        variant={AlertVariant.info}
      />
    </FormGroup>
  );
};

export default SupportedVolumesAlert;
