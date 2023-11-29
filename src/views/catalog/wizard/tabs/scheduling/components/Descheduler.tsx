import React, { FC, useState } from 'react';
import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Switch } from '@patternfly/react-core';
import { isLiveMigratable } from '@virtualmachines/utils';

type DeschedulerProps = {
  vm: V1VirtualMachine;
};

const Descheduler: FC<DeschedulerProps> = ({ vm }) => {
  const deschedulerLabel =
    vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL] === 'true';
  const [isChecked, setChecked] = useState<boolean>(deschedulerLabel);
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const isMigratable = isLiveMigratable(vm, isSingleNodeCluster);
  const isDeschedulerInstalled = useDeschedulerInstalled();
  const isAdmin = useIsAdmin();
  const isDeschedulerEnabled = isAdmin && isDeschedulerInstalled && isMigratable;

  const updatedDescheduler = (checked: boolean) => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, 'spec.template.metadata.annotations');
      if (!vmDraft.spec.template.metadata.annotations)
        vmDraft.spec.template.metadata.annotations = {};
      if (checked) {
        vmDraft.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL] = 'true';
      } else {
        delete vmDraft.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL];
      }
    });
    return k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });
  };

  return (
    <>
      <Switch
        onChange={(checked) => {
          setChecked(checked);
          updatedDescheduler(checked);
        }}
        id="descheduler-switch"
        isChecked={isChecked}
        isDisabled={!isDeschedulerEnabled}
      />
    </>
  );
};

export default Descheduler;
