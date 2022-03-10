import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button } from '@patternfly/react-core';

type SnapshotModalFooterProps = {
  onSubmit: () => void;
  onClose: () => void;
  isDisabled?: boolean;
  isProcessing?: boolean;
};

const SnapshotModalFooter: React.FC<SnapshotModalFooterProps> = ({
  onSubmit,
  onClose,
  isDisabled,
  isProcessing,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <ActionGroup>
      <Button isLoading={isProcessing} onClick={onSubmit} isDisabled={isDisabled} variant="primary">
        {t('Submit')}
      </Button>
      <Button onClick={onClose} variant="link">
        {t('Cancel')}
      </Button>
    </ActionGroup>
  );
};

export default SnapshotModalFooter;
