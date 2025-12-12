import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { createNetworkCheckup } from '../../utils/utils';

type CheckupsNetworkFormActionsProps = {
  checkupImage: string;
  desiredLatency: string;
  isNodesChecked: boolean;
  name: string;
  nodeSource: string;
  nodeTarget: string;
  sampleDuration: string;
  selectedNAD: string;
};

const CheckupsNetworkFormActions: FC<CheckupsNetworkFormActionsProps> = ({
  checkupImage,
  desiredLatency,
  isNodesChecked,
  name,
  nodeSource,
  nodeTarget,
  sampleDuration,
  selectedNAD,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();
  const [error, setError] = useState<string>(null);
  const shouldDisableNodes = isNodesChecked ? nodeSource && nodeTarget : true;
  const isSubmitDisabled = !name || !selectedNAD || !shouldDisableNodes || !checkupImage;

  return (
    <>
      <ActionGroup>
        <Button
          onClick={async () => {
            setError(null);
            try {
              await createNetworkCheckup({
                checkupImage,
                cluster,
                desiredLatency,
                name,
                namespace,
                nodeSource,
                nodeTarget,
                sampleDuration,
                selectedNAD,
              });
              navigate(
                isACMPage
                  ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups`
                  : `/k8s/ns/${namespace}/checkups`,
              );
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
        <Button onClick={() => navigate(-1)} variant={ButtonVariant.secondary}>
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
