import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { createStorageCheckup } from '../../utils/utils';

type CheckupsStorageFormActionsProps = {
  name: string;
  timeOut: string;
};

const CheckupsStorageFormActions: FC<CheckupsStorageFormActionsProps> = ({ name, timeOut }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [namespace] = useActiveNamespace();
  const [error, setError] = useState<string>(null);

  return (
    <>
      <ActionGroup>
        <Button
          onClick={async () => {
            setError(null);
            try {
              await createStorageCheckup(namespace, timeOut, name);
              history.push(`/k8s/ns/${namespace}/checkups/storage`);
            } catch (e) {
              kubevirtConsole.log(e);
              setError(e?.message);
            }
          }}
          isDisabled={isEmpty(name) || isEmpty(timeOut)}
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

export default CheckupsStorageFormActions;
