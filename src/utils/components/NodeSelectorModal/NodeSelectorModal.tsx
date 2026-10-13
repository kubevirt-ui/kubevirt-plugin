import { type FC, useMemo } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNodeSelector } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import LabelsList from './components/LabelList';
import LabelRow from './components/LabelRow';
import NodeCheckerAlert from './components/NodeCheckerAlert';
import { useIDEntities } from './hooks/useIDEntities';
import { useNodeLabelQualifier } from './hooks/useNodeLabelQualifier';
import {
  getNodeSelectorModalSubmitTooltip,
  hasIncompleteSelectorLabels,
  idLabelsToNodeSelector,
  isEqualObject,
  nodeSelectorToIDLabels,
  produceVMWithNodeSelector,
} from './utils/helpers';
import { type IDLabel } from './utils/types';

type NodeSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const NodeSelectorModal: FC<NodeSelectorModalProps> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const nodeSelector = getNodeSelector(vm) ?? {};

  const {
    entities: selectorLabels,
    onEntityAdd: onLabelAdd,
    onEntityChange: onLabelChange,
    onEntityDelete: onLabelDelete,
  } = useIDEntities<IDLabel>(nodeSelectorToIDLabels(nodeSelector));

  const updatedVM = useMemo(
    () => produceVMWithNodeSelector(vm, selectorLabels),
    [vm, selectorLabels],
  );

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const qualifiedNodes = useNodeLabelQualifier(nodes, nodesLoaded, selectorLabels);
  const isIncomplete = hasIncompleteSelectorLabels(selectorLabels);
  const isEmptySelectorLabels = isEmpty(selectorLabels);
  const hasNotChanged = isEqualObject(nodeSelector, idLabelsToNodeSelector(selectorLabels));

  const onSelectorLabelAdd = (): void => onLabelAdd({ id: null, key: '', value: '' });

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Node selector')}
      isDisabled={hasNotChanged || isIncomplete}
      isOpen={isOpen}
      obj={updatedVM}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNodeSelectorModalSubmitTooltip(hasNotChanged, isIncomplete, t)}
    >
      <LabelsList
        isEmpty={isEmptySelectorLabels}
        model={!isEmpty(nodes) ? NodeModel : undefined}
        onLabelAdd={onSelectorLabelAdd}
      >
        {!isEmptySelectorLabels && (
          <>
            {selectorLabels.map((label, index) => (
              <LabelRow
                key={label.id}
                label={label}
                onChange={onLabelChange}
                onDelete={onLabelDelete}
                withKeyValueTitle={index === 0}
              />
            ))}
          </>
        )}
      </LabelsList>
      {!isEmpty(nodes) && (
        <NodeCheckerAlert
          nodesLoaded={true}
          qualifiedNodes={isEmptySelectorLabels ? nodes : qualifiedNodes}
        />
      )}
    </TabModal>
  );
};

export default NodeSelectorModal;
