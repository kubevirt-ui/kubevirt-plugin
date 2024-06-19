import React, { FC, useMemo } from 'react';
import produce from 'immer';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';

import LabelsList from './components/LabelList';
import LabelRow from './components/LabelRow';
import NodeCheckerAlert from './components/NodeCheckerAlert';
import { useIDEntities } from './hooks/useIDEntities';
import { useNodeLabelQualifier } from './hooks/useNodeLabelQualifier';
import { isEqualObject, nodeSelectorToIDLabels } from './utils/helpers';
import { IDLabel } from './utils/types';

type NodeSelectorModalProps = {
  isOpen: boolean;
  nodes?: IoK8sApiCoreV1Node[];
  nodesLoaded?: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const NodeSelectorModal: FC<NodeSelectorModalProps> = ({
  isOpen,
  nodes,
  nodesLoaded,
  onClose,
  onSubmit,
  vm,
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

  const updatedVirtualMachine = useMemo(() => {
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
      headerText={t('Node selector')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
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
            nodesLoaded={nodesLoaded}
            qualifiedNodes={selectorLabels?.length === 0 ? nodes : qualifiedNodes}
          />
        )}
      </Form>
    </TabModal>
  );
};

export default NodeSelectorModal;
