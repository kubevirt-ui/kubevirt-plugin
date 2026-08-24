import React, { useMemo } from 'react';

import {
  VirtualMachineInstanceModel,
  VirtualMachineInstanceModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  type Action,
  k8sDelete,
  k8sPatch,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ModalProps = { isOpen: boolean; onClose: () => void };

type UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => [Action[], boolean, undefined];

const renderLabelsModal =
  (vmi: V1VirtualMachineInstance) =>
  ({ isOpen, onClose }: ModalProps): React.ReactNode => (
    <LabelsModal
      isOpen={isOpen}
      obj={vmi}
      onClose={onClose}
      onLabelsSubmit={(labels) =>
        k8sPatch({
          data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
          model: VirtualMachineInstanceModel,
          resource: vmi,
        })
      }
    />
  );

const renderAnnotationsModal =
  (vmi: V1VirtualMachineInstance) =>
  ({ isOpen, onClose }: ModalProps): React.ReactNode => (
    <AnnotationsModal
      isOpen={isOpen}
      obj={vmi}
      onClose={onClose}
      onSubmit={(annotations) =>
        k8sPatch({
          data: [{ op: 'replace', path: '/metadata/annotations', value: annotations }],
          model: VirtualMachineInstanceModel,
          resource: vmi,
        })
      }
    />
  );

const renderDeleteModal =
  (vmi: V1VirtualMachineInstance, t: (key: string) => string) =>
  ({ isOpen, onClose }: ModalProps): React.ReactNode => (
    <DeleteModal
      headerText={t('Delete VirtualMachineInstance?')}
      isOpen={isOpen}
      obj={vmi}
      onClose={onClose}
      onDeleteSubmit={() =>
        k8sDelete({
          json: undefined,
          model: VirtualMachineInstanceModel,
          requestInit: undefined,
          resource: vmi,
        })
      }
    />
  );

const useVirtualMachineInstanceActionsProvider: UseVirtualMachineInstanceActionsProvider = (
  vmi: V1VirtualMachineInstance,
) => {
  const { t } = useKubevirtTranslation();
  const [, inFlight] = useK8sModel(VirtualMachineInstanceModelRef);
  const { createModal } = useModal();
  const actions = useMemo(
    () => [
      {
        cta: (): void => {
          window.open(
            `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/console/standalone`,
          );
        },
        disabled: inFlight,
        icon: <ExternalLinkAltIcon />,
        id: 'open-console',
        label: t('Open console'),
      },
      {
        cta: (): void => createModal(renderLabelsModal(vmi)),
        id: 'edit-labels',
        label: t('Edit labels'),
      },
      {
        cta: (): void => createModal(renderAnnotationsModal(vmi)),
        id: 'edit-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(VirtualMachineInstanceModel, vmi, 'delete'),
        cta: (): void => createModal(renderDeleteModal(vmi, t)),
        id: 'delete-virtual-machine-instance',
        label: t('Delete VirtualMachineInstance'),
      },
    ],
    [vmi, inFlight, createModal, t],
  );

  return useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineInstanceActionsProvider;
