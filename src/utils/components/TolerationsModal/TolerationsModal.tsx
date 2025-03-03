import * as React from 'react';
import produce from 'immer';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  K8sIoApiCoreV1Toleration,
  K8sIoApiCoreV1TolerationEffectEnum,
  K8sIoApiCoreV1TolerationOperatorEnum,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTolerations } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { Form, Stack, StackItem } from '@patternfly/react-core';
import { ModalVariant } from '@patternfly/react-core/deprecated';

import { TolerationLabel } from './utils/constants';
import { getNodeTaintQualifier } from './utils/helpers';
import TolerationEditRow from './TolerationEditRow';
import TolerationListHeaders from './TolerationListHeaders';
import TolerationModalDescriptionText from './TolerationModalDescriptionText';

type TolerationsModalProps = {
  isOpen: boolean;
  nodes?: IoK8sApiCoreV1Node[];
  nodesLoaded?: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const TolerationsModal: React.FC<TolerationsModalProps> = ({
  isOpen,
  nodes,
  nodesLoaded,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: tolerationsLabels,
    onEntityAdd: onTolerationAdd,
    onEntityChange: onTolerationChange,
    onEntityDelete: onTolerationDelete,
  } = useIDEntities<TolerationLabel>(
    (getTolerations(vm) || []).map((toleration, id) => ({ ...toleration, id })),
  );

  const tolerationLabelsEmpty = tolerationsLabels?.length === 0;

  const qualifiedNodes = getNodeTaintQualifier(nodes, nodesLoaded, tolerationsLabels);

  const onSelectorLabelAdd = () =>
    onTolerationAdd({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      id: null,
      key: '',
      value: '',
    });

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec.tolerations']);

      const updatedTolerations: K8sIoApiCoreV1Toleration[] = (tolerationsLabels || []).map(
        (toleration) => {
          return {
            ...toleration,
            operator: toleration?.value
              ? K8sIoApiCoreV1TolerationOperatorEnum.Equal
              : K8sIoApiCoreV1TolerationOperatorEnum.Exists,
          };
        },
      );

      vmDraft.spec.template.spec.tolerations = updatedTolerations;
    });
    return updatedVM;
  }, [tolerationsLabels, vm]);

  return (
    <TabModal
      headerText={t('Tolerations')}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Stack hasGutter>
        <StackItem>{vmi && <ModalPendingChangesAlert />}</StackItem>
        <StackItem>
          <TolerationModalDescriptionText />
        </StackItem>
        <StackItem>
          <Form>
            <LabelsList
              addRowText={t('Add toleration')}
              emptyStateAddRowText={t('Add toleration to specify qualifying Nodes')}
              isEmpty={tolerationLabelsEmpty}
              model={!isEmpty(nodes) && NodeModel}
              onLabelAdd={onSelectorLabelAdd}
            >
              {!tolerationLabelsEmpty && (
                <>
                  <TolerationListHeaders />
                  {tolerationsLabels.map((label) => (
                    <TolerationEditRow
                      key={label.id}
                      label={label}
                      onChange={onTolerationChange}
                      onDelete={onTolerationDelete}
                    />
                  ))}
                </>
              )}
            </LabelsList>
            {!tolerationLabelsEmpty && nodesLoaded && (
              <NodeCheckerAlert
                nodesLoaded={nodesLoaded}
                qualifiedNodes={tolerationsLabels?.length === 0 ? nodes : qualifiedNodes}
              />
            )}
          </Form>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default TolerationsModal;
