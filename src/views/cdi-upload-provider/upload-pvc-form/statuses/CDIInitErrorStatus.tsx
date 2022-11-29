import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { killUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ErrorCircleOIcon } from '@patternfly/react-icons';

import { resourcePath } from '../../utils/utils';

type CDIInitErrorStatus = {
  onErrorClick: () => void;
  pvcName: string;
  namespace: string;
};

const CDIInitErrorStatus: React.FC<CDIInitErrorStatus> = ({ onErrorClick, pvcName, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [shouldKillDv, setShouldKillDv] = useState<boolean>(true);
  const [pod, podLoaded, podError] = useK8sWatchResource<K8sResourceCommon>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    namespace,
    name: `cdi-upload-${pvcName}`,
  });

  const history = useHistory();

  const onClick = async () => {
    shouldKillDv && (await killUploadPVC(pvcName, namespace));
    onErrorClick();
  };

  return (
    <>
      <EmptyStateIcon icon={ErrorCircleOIcon} color="#cf1010" />
      <Title headingLevel="h4" size="lg">
        {t('CDI Error: Could not initiate Data Volume')}
      </Title>
      <EmptyStateBody>
        <Stack hasGutter>
          <StackItem>
            {t(
              'Data Volume failed to initiate upload, you can either delete the Data Volume and try again, or check logs',
            )}
          </StackItem>
          <StackItem>
            <Split>
              <SplitItem isFilled />
              <Checkbox
                id="approve-checkbox"
                isChecked={shouldKillDv}
                data-checked-state={shouldKillDv}
                aria-label="kill datavolume checkbox"
                label={t('Delete Data Volume: {{pvcName}}', { pvcName })}
                onChange={(checked) => setShouldKillDv(checked)}
              />
              <SplitItem isFilled />
            </Split>
          </StackItem>
        </Stack>
      </EmptyStateBody>
      <Button id="cdi-upload-error-btn" variant="primary" onClick={onClick}>
        {shouldKillDv ? t('Back to form (Deletes DataVolume)') : t('Back to form')}
      </Button>
      {podLoaded && !podError && pod && (
        <EmptyStateSecondaryActions>
          <Button
            id="cdi-upload-check-logs"
            onClick={() =>
              history.push(`${resourcePath(PodModel, pod?.metadata?.name, namespace)}/logs`)
            }
            variant={ButtonVariant.link}
          >
            {t('Check logs')}
          </Button>
        </EmptyStateSecondaryActions>
      )}
    </>
  );
};

export default CDIInitErrorStatus;
