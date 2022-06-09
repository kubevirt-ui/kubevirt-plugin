import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedNodeSelector } from '../PendingChanges/utils/helpers';

import LabelsList from './components/LabelList';
import LabelRow from './components/LabelRow';
import NodeCheckerAlert from './components/NodeCheckerAlert';
import { useIDEntities } from './hooks/useIDEntities';
import { useNodeLabelQualifier } from './hooks/useNodeLabelQualifier';
import { isEqualObject, nodeSelectorToIDLabels } from './utils/helpers';
import { IDLabel } from './utils/types';

type NodeSelectorModalProps = {
  vm: V1VirtualMachine;
  nodes?: IoK8sApiCoreV1Node[];
  nodesLoaded?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const NodeSelectorModal: React.FC<NodeSelectorModalProps> = ({
  vm,
  nodes,
  nodesLoaded,
  isOpen,
  onClose,
  onSubmit,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: selectorLabels,
    onEntityAdd: onLabelAdd,
    onEntityChange: onLabelChange,
    onEntityDelete: onLabelDelete,
  } = useIDEntities<IDLabel>(nodeSelectorToIDLabels(getNodeSelector(vm)));

  const qualifiedNodes = useNodeLabelQualifier(nodes, nodesLoaded, selectorLabels);

  const onSelectorLabelAdd = () => onLabelAdd({ id: null, key: '', value: '' });

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.template.spec.nodeSelector']);
      if (!vmDraft.spec.template.spec.nodeSelector) {
        vmDraft.spec.template.spec.nodeSelector = {};
      }

      const k8sSelector: { [key: string]: string } = selectorLabels.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {},
      );

      if (!isEqualObject(getNodeSelector(vmDraft), k8sSelector)) {
        vmDraft.spec.template.spec.nodeSelector = k8sSelector;
      }
    });
    return updatedVM;
  }, [vm, selectorLabels]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Node selector')}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedNodeSelector(updatedVirtualMachine, vmi)}
          />
        )}
        <LabelsList
          isEmpty={selectorLabels?.length === 0}
          model={!isEmpty(nodes) && NodeModel}
          onLabelAdd={onSelectorLabelAdd}
        >
          {selectorLabels.length > 0 && (
            <>
              {selectorLabels.map((label) => (
                <LabelRow
                  key={label.id}
                  label={label}
                  onChange={onLabelChange}
                  onDelete={onLabelDelete}
                />
              ))}
            </>
          )}
        </LabelsList>
        {!isEmpty(nodes) && (
          <NodeCheckerAlert
            qualifiedNodes={selectorLabels?.length === 0 ? nodes : qualifiedNodes}
            nodesLoaded={nodesLoaded}
          />
        )}
      </Form>
    </TabModal>
  );
};

export default NodeSelectorModal;
