import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel, {
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreate } from '@openshift-console/dynamic-plugin-sdk';

type UserInstancetypeEmptyStateProps = {
  buttonText?: string;
  namespace: string;
};

const InstancetypeCreateButton: FC<UserInstancetypeEmptyStateProps> = ({
  buttonText,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  const activeTabKey = location?.pathname.includes(VirtualMachineClusterInstancetypeModel.kind)
    ? 0
    : 1;

  const groupVersionKind =
    activeTabKey === 0
      ? VirtualMachineClusterInstancetypeModelRef
      : VirtualMachineInstancetypeModelRef;

  return (
    <ListPageCreate
      createAccessReview={{
        groupVersionKind,
        ...(activeTabKey !== 0 && { namespace: namespace }),
      }}
      groupVersionKind={groupVersionKind}
    >
      {buttonText || t('Create')}
    </ListPageCreate>
  );
};

export default InstancetypeCreateButton;
