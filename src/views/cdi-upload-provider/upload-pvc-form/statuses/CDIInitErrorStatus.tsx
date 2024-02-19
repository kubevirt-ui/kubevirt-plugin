import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { killUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateIcon,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ErrorCircleOIcon } from '@patternfly/react-icons';

import { resourcePath } from '../../utils/utils';

type CDIInitErrorStatus = {
  namespace: string;
  onErrorClick: () => void;
  pvcName: string;
};

const CDIInitErrorStatus: FC<CDIInitErrorStatus> = ({ namespace, onErrorClick, pvcName }) => {
  const { t } = useKubevirtTranslation();
  const [shouldKillDv, setShouldKillDv] = useState<boolean>(true);
  const [pod, podLoaded, podError] = useK8sWatchResource<K8sResourceCommon>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    name: `cdi-upload-${pvcName}`,
    namespace,
  });

  const navigate = useNavigate();

  const onClick = async () => {
    shouldKillDv && (await killUploadPVC(pvcName, namespace));
    onErrorClick();
  };

  return (
    <>
      <EmptyStateIcon color="#cf1010" icon={ErrorCircleOIcon} />
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
                aria-label="kill datavolume checkbox"
                data-checked-state={shouldKillDv}
                id="approve-checkbox"
                isChecked={shouldKillDv}
                label={t('Delete Data Volume: {{pvcName}}', { pvcName })}
                onChange={(_event, checked) => setShouldKillDv(checked)}
              />
              <SplitItem isFilled />
            </Split>
          </StackItem>
        </Stack>
      </EmptyStateBody>
      <Button id="cdi-upload-error-btn" onClick={onClick} variant="primary">
        {shouldKillDv ? t('Back to form (Deletes DataVolume)') : t('Back to form')}
      </Button>
      {podLoaded && !podError && pod && (
        <EmptyStateActions>
          <Button
            onClick={() =>
              navigate(`${resourcePath(PodModel, pod?.metadata?.name, namespace)}/logs`)
            }
            id="cdi-upload-check-logs"
            variant={ButtonVariant.link}
          >
            {t('Check logs')}
          </Button>
        </EmptyStateActions>
      )}
    </>
  );
};

export default CDIInitErrorStatus;
