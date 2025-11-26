import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import useCheckupsNetworkPermissions from './network/hooks/useCheckupsNetworkPermissions';
import SelfValidationCheckupRunButton from './self-validation/components/SelfValidationCheckupRunButton';
import { useCheckupsStoragePermissions } from './storage/components/hooks/useCheckupsStoragePermissions';
import { CHECKUP_URLS } from './utils/constants';
import { getCurrentCheckupType, trimLastHistoryPath } from './utils/utils';

const CheckupsRunButton: FC = () => {
  const [namespace] = useActiveNamespace();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useKubevirtTranslation();

  const { isPermitted: isCreateNetworkPermitted } = useCheckupsNetworkPermissions();
  const { isPermitted: isCreateStoragePermitted } = useCheckupsStoragePermissions();

  const currentCheckupType = useMemo(
    () => getCurrentCheckupType(location.pathname),
    [location.pathname],
  );

  const isDisabled = useMemo(() => {
    if (ALL_NAMESPACES_SESSION_KEY === namespace) {
      return true;
    }

    switch (currentCheckupType) {
      case CHECKUP_URLS.NETWORK:
        return !isCreateNetworkPermitted;
      case CHECKUP_URLS.STORAGE:
        return !isCreateStoragePermitted;
      case CHECKUP_URLS.SELF_VALIDATION:
        // Self-validation is handled by SelfValidationCheckupRunButton
        return true;
      default:
        return true;
    }
  }, [namespace, currentCheckupType, isCreateNetworkPermitted, isCreateStoragePermitted]);

  const handleRunCheckup = () => {
    if (isDisabled || !currentCheckupType) return;

    const basePath = trimLastHistoryPath(location.pathname);
    switch (currentCheckupType) {
      case CHECKUP_URLS.NETWORK:
        navigate(createURL(`${CHECKUP_URLS.NETWORK}/form`, basePath));
        break;
      case CHECKUP_URLS.STORAGE:
        navigate(createURL(`${CHECKUP_URLS.STORAGE}/form`, basePath));
        break;
      // Self-validation is handled by SelfValidationCheckupRunButton
    }
  };

  if (currentCheckupType === CHECKUP_URLS.SELF_VALIDATION) {
    return <SelfValidationCheckupRunButton />;
  }

  return (
    <Button
      className={classNames({
        'CheckupsRunButton--main': ALL_NAMESPACES_SESSION_KEY === namespace,
      })}
      id="checkups-run-button"
      isDisabled={isDisabled}
      onClick={handleRunCheckup}
      variant={ButtonVariant.primary}
    >
      {t('Run checkup')}
    </Button>
  );
};

export default CheckupsRunButton;
