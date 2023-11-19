import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import classNames from 'classnames';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import useCheckupsNetworkPermissions from './network/hooks/useCheckupsNetworkPermissions';
import { useCheckupsStoragePermissions } from './storage/components/hooks/useCheckupsStoragePermissions';
import { trimLastHistoryPath } from './utils/utils';

const CheckupsRunButton: FC<{ history: RouteComponentProps['history'] }> = ({ history }) => {
  const [namespace] = useActiveNamespace();
  const { t } = useKubevirtTranslation();
  const { isPermitted: isCreateNetworkPermitted } = useCheckupsNetworkPermissions();
  const { isPermitted: isCreateStoragePermitted } = useCheckupsStoragePermissions();

  const createItems = {
    network: (
      <div
        className={classNames({ 'CheckupsRunButton--item__disabled': !isCreateNetworkPermitted })}
      >
        {t('Network latency')}
      </div>
    ),
    storage: (
      <div
        className={classNames({ 'CheckupsRunButton--item__disabled': !isCreateStoragePermitted })}
      >
        {t('Storage')}
      </div>
    ),
  };

  const onCreate = useCallback(
    (type: string) => {
      switch (type) {
        case 'network':
          return (
            isCreateNetworkPermitted &&
            history.push(createURL('network/form', trimLastHistoryPath(history)))
          );
        case 'storage':
          return (
            isCreateStoragePermitted &&
            history.push(createURL('storage/form', trimLastHistoryPath(history)))
          );
      }
    },
    [history, isCreateNetworkPermitted, isCreateStoragePermitted],
  );

  return (
    <Button
      className={classNames({
        'CheckupsRunButton--main': ALL_NAMESPACES_SESSION_KEY === namespace,
      })}
      isDisabled={ALL_NAMESPACES_SESSION_KEY === namespace}
      variant={ButtonVariant.plain}
    >
      <ListPageCreateDropdown items={createItems} onClick={onCreate}>
        {t('Run checkup')}
      </ListPageCreateDropdown>
    </Button>
  );
};

export default CheckupsRunButton;
