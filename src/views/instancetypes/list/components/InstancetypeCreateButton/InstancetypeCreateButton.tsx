import { type FC } from 'react';
import { useLocation } from 'react-router';

import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModel,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
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
  const cluster = useClusterParam();

  const isClusterInstancetypePage = location?.pathname.includes(
    VirtualMachineClusterInstancetypeModel.kind,
  );

  const [model, groupVersionKind] = isClusterInstancetypePage
    ? [
        VirtualMachineClusterInstancetypeModel,
        VirtualMachineClusterInstancetypeModelGroupVersionKind,
      ]
    : [VirtualMachineInstancetypeModel, VirtualMachineInstancetypeModelGroupVersionKind];

  const canCreateInstancetype = useCanCreateResource({
    cluster,
    model,
    namespace,
  });

  const createButtonText = buttonText ?? t('Create');

  if (!canCreateInstancetype) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return <ListPageCreate groupVersionKind={groupVersionKind}>{createButtonText}</ListPageCreate>;
};

export default InstancetypeCreateButton;
