import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { navigateToVMWizard } from '@multicluster/urls';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { RocketIcon, VirtualMachineIcon } from '@patternfly/react-icons';

type VirtualMachineInstanceEmptyStateProps = {
  cluster: string;
  namespace: string;
};
const VirtualMachineInstanceEmptyState: FC<VirtualMachineInstanceEmptyStateProps> = ({
  cluster,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <ListEmptyState
      buttonAction={
        <Button
          onClick={() => navigateToVMWizard({ cluster, namespace, navigate })}
          variant={ButtonVariant.primary}
        >
          {t('Create VirtualMachine')}
        </Button>
      }
      learnMoreLink={
        <Button
          icon={<RocketIcon />}
          onClick={() => navigate({ pathname: '/quickstart', search: '?keyword=virtual+machine' })}
          variant={ButtonVariant.secondary}
        >
          {t('Learn how to use VirtualMachines')}
        </Button>
      }
      bodyContent={t('To get started, create a VirtualMachine.')}
      icon={VirtualMachineIcon}
      titleText={t("You don't have any VirtualMachineInstances yet")}
    />
  );
};

export default VirtualMachineInstanceEmptyState;
