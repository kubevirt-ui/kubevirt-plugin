import * as React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action, k8sDelete, k8sPatch, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => [Action[], boolean, any];

const useVirtualMachineInstanceActionsProvider: UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => {
  const { t } = useKubevirtTranslation();
  const [, inFlight] = useK8sModel(VirtualMachineInstanceModelRef);
  const { createModal } = useModal();
  const actions = React.useMemo(
    () => [
      {
        id: 'open-console',
        label: t('Open Console'),
        icon: <ExternalLinkAltIcon />,
        disabled: inFlight,
        cta: () =>
          window.open(
            `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachineInstance/${vmi?.metadata?.name}/console/standalone`,
          ),
      },
      {
        id: 'edit-labels',
        label: t('Edit Labels'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              obj={vmi}
              isOpen={isOpen}
              onClose={onClose}
              onLabelsSubmit={(labels) =>
                k8sPatch({
                  model: VirtualMachineInstanceModel,
                  resource: vmi,
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                })
              }
            />
          )),
      },
      {
        id: 'edit-annotations',
        label: t('Edit Annotations'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              obj={vmi}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={(annotations) =>
                k8sPatch({
                  model: VirtualMachineInstanceModel,
                  resource: vmi,
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/annotations',
                      value: annotations,
                    },
                  ],
                })
              }
            />
          )),
      },
      {
        id: 'delete-virtual-machine-instance',
        label: t('Delete Virtual Machine Instance'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              obj={vmi}
              isOpen={isOpen}
              onClose={onClose}
              headerText={t('Delete Virtual Machine Instance?')}
              onDeleteSubmit={() =>
                k8sDelete({
                  model: VirtualMachineInstanceModel,
                  resource: vmi,
                  json: undefined,
                  requestInit: undefined,
                })
              }
            />
          )),
      },
    ],
    [vmi, inFlight, createModal, t],
  );

  return [actions, !inFlight, undefined];
};

export default useVirtualMachineInstanceActionsProvider;
