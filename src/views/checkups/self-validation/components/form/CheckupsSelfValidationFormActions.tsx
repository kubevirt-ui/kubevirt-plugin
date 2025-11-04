import React, { FC, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { CHECKUP_URLS } from '../../../utils/constants';
import {
  createSelfValidationCheckup,
  getAllRunningSelfValidationJobs,
  getRunningCheckupErrorMessage,
} from '../../utils';

type CheckupsSelfValidationFormActionsProps = {
  checkupImage: string;
  isDryRun: boolean;
  name: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
};

const CheckupsSelfValidationFormActions: FC<CheckupsSelfValidationFormActionsProps> = ({
  checkupImage,
  isDryRun,
  name,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [namespace] = useActiveNamespace();
  const [error, setError] = useState<ReactNode>(null);

  const isSubmitDisabled = !name || !checkupImage || selectedTestSuites.length === 0;

  return (
    <>
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
      <ActionGroup>
        <Button
          onClick={async () => {
            setError(null);
            try {
              // Check for running jobs across the cluster
              const runningJobs = await getAllRunningSelfValidationJobs();
              if (runningJobs.length > 0) {
                setError(getRunningCheckupErrorMessage(t, runningJobs));
                return;
              }

              await createSelfValidationCheckup(
                namespace,
                name,
                checkupImage,
                selectedTestSuites,
                isDryRun,
                storageClass,
                testSkips,
                storageCapabilities,
              );
              navigate(`/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/${name}`);
            } catch (e) {
              kubevirtConsole.error(e);
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
    </>
  );
};

export default CheckupsSelfValidationFormActions;
