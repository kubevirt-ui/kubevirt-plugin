import * as React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
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
        cta: () =>
          window.open(
            `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachineInstance/${vmi?.metadata?.name}/console/standalone`,
          ),
        disabled: inFlight,
        icon: <ExternalLinkAltIcon />,
        id: 'open-console',
        label: t('Open Console'),
      },
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              onLabelsSubmit={(labels) =>
                k8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                  model: VirtualMachineInstanceModel,
                  resource: vmi,
                })
              }
              isOpen={isOpen}
              obj={vmi}
              onClose={onClose}
            />
          )),
        id: 'edit-labels',
        label: t('Edit Labels'),
      },
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              onSubmit={(annotations) =>
                k8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/annotations',
                      value: annotations,
                    },
                  ],
                  model: VirtualMachineInstanceModel,
                  resource: vmi,
                })
              }
              isOpen={isOpen}
              obj={vmi}
              onClose={onClose}
            />
          )),
        id: 'edit-annotations',
        label: t('Edit Annotations'),
      },
      {
        accessReview: asAccessReview(VirtualMachineInstanceModel, vmi, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              onDeleteSubmit={() =>
                k8sDelete({
                  json: undefined,
                  model: VirtualMachineInstanceModel,
                  requestInit: undefined,
                  resource: vmi,
                })
              }
              headerText={t('Delete VirtualMachineInstance?')}
              isOpen={isOpen}
              obj={vmi}
              onClose={onClose}
            />
          )),
        id: 'delete-virtual-machine-instance',
        label: t('Delete VirtualMachineInstance'),
      },
    ],
    [vmi, inFlight, createModal, t],
  );

  return React.useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineInstanceActionsProvider;
