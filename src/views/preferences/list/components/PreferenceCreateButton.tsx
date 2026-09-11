import { type FC } from 'react';
import { useLocation } from 'react-router';

import {
  VirtualMachineClusterPreferenceModel,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModel,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreate } from '@openshift-console/dynamic-plugin-sdk';

type PreferenceCreateButtonProps = {
  buttonText?: string;
  namespace: string;
};

const PreferenceCreateButton: FC<PreferenceCreateButtonProps> = ({ buttonText, namespace }) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  const isClusterPreferencePage = location?.pathname.includes(
    VirtualMachineClusterPreferenceModel.kind,
  );

  const [model, groupVersionKind] = isClusterPreferencePage
    ? [VirtualMachineClusterPreferenceModel, VirtualMachineClusterPreferenceModelGroupVersionKind]
    : [VirtualMachinePreferenceModel, VirtualMachinePreferenceModelGroupVersionKind];

  const canCreatePreference = useCanCreateResource({
    model,
    namespace,
  });

  const createButtonText = buttonText ?? t('Create');

  if (!canCreatePreference) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return <ListPageCreate groupVersionKind={groupVersionKind}>{createButtonText}</ListPageCreate>;
};

export default PreferenceCreateButton;
