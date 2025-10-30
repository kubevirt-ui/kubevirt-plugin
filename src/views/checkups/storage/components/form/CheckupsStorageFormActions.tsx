import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { CHECKUP_URLS } from '../../../utils/constants';
import { createStorageCheckup } from '../../utils/utils';

type CheckupsStorageFormActionsProps = {
  checkupImage: string;
  name: string;
  timeOut: string;
};

const CheckupsStorageFormActions: FC<CheckupsStorageFormActionsProps> = ({
  checkupImage,
  name,
  timeOut,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [namespace] = useActiveNamespace();
  const [error, setError] = useState<string>(null);

  return (
    <>
      <ActionGroup>
        <Button
          onClick={async () => {
            setError(null);
            try {
              await createStorageCheckup(namespace, timeOut, name, checkupImage);
              navigate(`/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}`);
            } catch (e) {
              kubevirtConsole.log(e);
              setError(e?.message);
            }
          }}
          isDisabled={isEmpty(name) || isEmpty(timeOut) || !checkupImage}
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
