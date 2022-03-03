import * as React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => [Action[], boolean, any];

const useVirtualMachineInstanceActionsProvider: UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => {
  const [, inFlight] = useK8sModel(VirtualMachineInstanceModelRef);
  const actions = React.useMemo(
    () => [
      {
        id: 'open-console',
        label: 'Open Console',
        icon: <ExternalLinkAltIcon />,
        disabled: inFlight,
        cta: () =>
          window.open(
            // *** Should create path and component in a sperate PR and connect it to the plugin ***

            // `/k8s/ns/${getNamespace(vmi)}/virtualmachineinstances/${getName(
            //   vmi,
            // )}/standaloneconsole`,
            // `${getName(vmi)}-console}`,
            // 'modal=yes,alwaysRaised=yes,location=yes,width=1024,height=768',
            `/${vmi?.metadata?.name}`,
          ),
      },
      {
        id: 'edit-labels',
        label: 'Edit Labels',
        // waiting for modal launcher
        cta: () => console.log('helloWorld', vmi),
      },
      {
        id: 'edit-annotations',
        label: 'Edit Annotations',
        // waiting for modal launcher
        cta: () => console.log('helloWorld'),
      },
      {
        id: 'delete-virtual-machine-instance',
        label: 'Delete Virtual Machine Instance',
        // waiting for modal launcher
        cta: () => console.log('helloWorld'),
      },
    ],
    [vmi, inFlight],
  );

  return [actions, !inFlight, undefined];
};

export default useVirtualMachineInstanceActionsProvider;
