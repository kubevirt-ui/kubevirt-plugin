import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStorageCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import SelfValidationCheckupRunButton from './self-validation/components/SelfValidationCheckupRunButton';
import { useCheckupsStoragePermissions } from './storage/components/hooks/useCheckupsStoragePermissions';
import { CHECKUP_URLS } from './utils/constants';
import { getCurrentCheckupType, getSelectProjectText, trimLastHistoryPath } from './utils/utils';

const CheckupsRunButton: FC = () => {
  const namespace = useActiveNamespace();
  const isACMpage = useIsACMPage();
  const navigate = useNavigate();
  const location = useLocation();
  const cluster = useClusterParam();
  const [hubClusterName] = useHubClusterName();
  const { t } = useKubevirtTranslation();

  const { isPermitted: isCreateStoragePermitted } = useCheckupsStoragePermissions();

  const currentCheckupType = useMemo(
    () => getCurrentCheckupType(location.pathname),
    [location.pathname],
  );

  const isAllNamespaces = namespace === ALL_NAMESPACES_SESSION_KEY;

  const isDisabled = useMemo(() => {
    if (isAllNamespaces) {
      return true;
    }

    switch (currentCheckupType) {
      case CHECKUP_URLS.STORAGE:
        return !isCreateStoragePermitted;
      case CHECKUP_URLS.SELF_VALIDATION:
        // Self-validation is handled by SelfValidationCheckupRunButton
        return true;
      default:
        return true;
    }
  }, [namespace, currentCheckupType, isCreateStoragePermitted]);

  const handleRunCheckup = () => {
    if (isDisabled || !currentCheckupType) return;

    const basePath = trimLastHistoryPath(location.pathname);
    switch (currentCheckupType) {
      case CHECKUP_URLS.STORAGE:
        navigate(
          isACMpage
            ? getStorageCheckupURL('form', namespace, cluster || hubClusterName)
            : createURL(`${CHECKUP_URLS.STORAGE}/form`, basePath),
        );
        break;
      // Self-validation is handled by SelfValidationCheckupRunButton
    }
  };

  if (currentCheckupType === CHECKUP_URLS.SELF_VALIDATION) {
    return <SelfValidationCheckupRunButton />;
  }

  const button = (
    <Button
      id="checkups-run-button"
      isDisabled={isDisabled}
      onClick={handleRunCheckup}
      variant={ButtonVariant.primary}
    >
      {t('Run checkup')}
    </Button>
  );

  if (isAllNamespaces) {
    return (
      <Tooltip content={getSelectProjectText(t)}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default CheckupsRunButton;
