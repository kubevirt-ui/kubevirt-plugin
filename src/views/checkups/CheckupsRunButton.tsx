import React, { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import useCheckupsNetworkPermissions from './network/hooks/useCheckupsNetworkPermissions';
import useCheckupsSelfValidationPermissions from './self-validation/components/hooks/useCheckupsSelfValidationPermissions';
import { useCheckupsStoragePermissions } from './storage/components/hooks/useCheckupsStoragePermissions';
import { CHECKUP_URLS } from './utils/constants';
import { getCheckUpTabs } from './utils/getCheckUpsTabs';
import { trimLastHistoryPath } from './utils/utils';

const CheckupsRunButton: FC = () => {
  const [namespace] = useActiveNamespace();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useKubevirtTranslation();

  const { isPermitted: isCreateNetworkPermitted } = useCheckupsNetworkPermissions();
  const { isPermitted: isCreateStoragePermitted } = useCheckupsStoragePermissions();
  const { isPermitted: isCreateSelfValidationPermitted } = useCheckupsSelfValidationPermissions();

  const tabs = useMemo(() => getCheckUpTabs(t), [t]);

  const getPermissionForTab = useCallback(
    (url: string) => {
      switch (url) {
        case CHECKUP_URLS.NETWORK:
          return isCreateNetworkPermitted;
        case CHECKUP_URLS.STORAGE:
          return isCreateStoragePermitted;
        case CHECKUP_URLS.SELF_VALIDATION:
          return isCreateSelfValidationPermitted;
        default:
          return false;
      }
    },
    [isCreateNetworkPermitted, isCreateStoragePermitted, isCreateSelfValidationPermitted],
  );

  const createItems = useMemo(() => {
    const items: Record<string, React.ReactNode> = {};

    tabs.forEach((tab) => {
      const isPermitted = getPermissionForTab(tab.url);

      items[tab.url] = (
        <div className={classNames({ 'CheckupsRunButton--item__disabled': !isPermitted })}>
          {tab.title}
        </div>
      );
    });

    return items;
  }, [tabs, getPermissionForTab]);

  const onCreate = useCallback(
    (type: string) => {
      const isPermitted = getPermissionForTab(type);
      if (isPermitted) {
        navigate(createURL(`${type}/form`, trimLastHistoryPath(location.pathname)));
      }
    },
    [getPermissionForTab, navigate, location],
  );

  return (
    <Button
      className={classNames({
        'CheckupsRunButton--main': ALL_NAMESPACES_SESSION_KEY === namespace,
      })}
      hasNoPadding
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
