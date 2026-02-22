import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { CHECKUP_URLS } from '../../../utils/constants';
import { createStorageCheckup, isNumOfVMsInvalid } from '../../utils/utils';

import { StorageCheckupAdvancedSettings } from './AdvancedSettings';

type CheckupsStorageFormActionsProps = {
  advancedSettings: StorageCheckupAdvancedSettings;
  checkupImage: string;
  name: string;
  timeOut: string;
};

const CheckupsStorageFormActions: FC<CheckupsStorageFormActionsProps> = ({
  advancedSettings,
  checkupImage,
  name,
  timeOut,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();
  const [error, setError] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <ActionGroup>
        <Button
          isDisabled={
            isEmpty(name) ||
            isEmpty(timeOut) ||
            !checkupImage ||
            isSubmitting ||
            isNumOfVMsInvalid(advancedSettings.numOfVMs)
          }
          onClick={async () => {
            setError(null);
            setIsSubmitting(true);
            try {
              await createStorageCheckup({
                checkupImage,
                cluster,
                name,
                namespace,
                timeOut,
                ...advancedSettings,
              });
              navigate(`/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}`);
            } catch (e) {
              kubevirtConsole.log(e);
              setError(e?.message);
            } finally {
              setIsSubmitting(false);
            }
          }}
          isLoading={isSubmitting}
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

export default CheckupsStorageFormActions;
