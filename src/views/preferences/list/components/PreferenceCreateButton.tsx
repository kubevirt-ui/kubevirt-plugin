import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreate } from '@openshift-console/dynamic-plugin-sdk';

type PreferenceCreateButtonProps = {
  buttonText?: string;
  namespace: string;
};

const PreferenceCreateButton: FC<PreferenceCreateButtonProps> = ({ buttonText, namespace }) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const activeTabKey = location?.pathname.includes(
    VirtualMachineClusterPreferenceModelGroupVersionKind.kind,
  )
    ? 0
    : 1;
  const groupVersionKind =
    activeTabKey === 0
      ? VirtualMachineClusterPreferenceModelGroupVersionKind
      : VirtualMachinePreferenceModelGroupVersionKind;

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

export default PreferenceCreateButton;
