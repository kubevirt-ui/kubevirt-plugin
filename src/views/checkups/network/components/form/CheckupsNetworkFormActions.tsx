import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { createNetworkCheckup } from '../../utils/utils';

type CheckupsNetworkFormActionsProps = {
  desiredLatency: string;
  isNodesChecked: boolean;
  name: string;
  nodeSource: string;
  nodeTarget: string;
  sampleDuration: string;
  selectedNAD: string;
};

const CheckupsNetworkFormActions: FC<CheckupsNetworkFormActionsProps> = ({
  desiredLatency,
  isNodesChecked,
  name,
  nodeSource,
  nodeTarget,
  sampleDuration,
  selectedNAD,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [namespace] = useActiveNamespace();
  const [error, setError] = useState<string>(null);
  const shouldDisableNodes = isNodesChecked ? nodeSource && nodeTarget : true;
  const isSubmitDisabled = !name || !selectedNAD || !shouldDisableNodes;

  return (
    <>
      <ActionGroup>
        <Button
          onClick={async () => {
            setError(null);
            try {
              await createNetworkCheckup({
                desiredLatency,
                name,
                namespace,
                nodeSource,
                nodeTarget,
                sampleDuration,
                selectedNAD,
              });
              history.push(`/k8s/ns/${namespace}/checkups`);
            } catch (e) {
              kubevirtConsole.log(e);
              setError(e?.message);
            }
          }}
          isDisabled={isSubmitDisabled}
          variant={ButtonVariant.primary}
        >
          {t('Run')}
        </Button>
        <Button onClick={() => history.goBack()} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
      {error && (
        <Alert title={t('Failed to create resource')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default CheckupsNetworkFormActions;
