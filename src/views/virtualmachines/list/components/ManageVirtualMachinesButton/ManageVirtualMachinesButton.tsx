import React, { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

type ManageVirtualMachinesButtonProps = {
  variant?: ButtonVariant;
};

const ManageVirtualMachinesButton: FC<ManageVirtualMachinesButtonProps> = ({
  variant = ButtonVariant.link,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const cluster = useActiveClusterParam();
  const [namespace] = useActiveNamespace();

  const virtualMachinesURL = useMemo(
    () => getVMListPath(namespace, cluster, `${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`),
    [cluster, namespace],
  );

  return (
    <Button
      isDisabled={!virtualMachinesURL}
      onClick={() => navigate(virtualMachinesURL)}
      variant={variant}
    >
      {t('Manage VirtualMachines')}
    </Button>
  );
};

export default ManageVirtualMachinesButton;
