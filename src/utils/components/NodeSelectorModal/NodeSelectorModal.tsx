import { type ReactNode } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
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
} from './utils/helpers';
import { type IDLabel } from './utils/types';

type NodeSelectorModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  isOpen: boolean;
  nodeSelector: Record<string, string> | undefined;
  onClose: () => void;
  onSubmit: (updatedResource: T) => Promise<T | void>;
  produceUpdatedResource: (selectorLabels: IDLabel[]) => T;
};

const NodeSelectorModal = <T extends K8sResourceCommon>({
  isOpen,
  nodeSelector = {},
  onClose,
  onSubmit,
  produceUpdatedResource,
}: NodeSelectorModalProps<T>): ReactNode => {
  const { t } = useKubevirtTranslation();
  const {
    entities: selectorLabels,
    onEntityAdd: onLabelAdd,
    onEntityChange: onLabelChange,
    onEntityDelete: onLabelDelete,
  } = useIDEntities<IDLabel>(nodeSelectorToIDLabels(nodeSelector));

  const updatedResource = produceUpdatedResource(selectorLabels);

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(updatedResource),
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const qualifiedNodes = useNodeLabelQualifier(nodes, nodesLoaded, selectorLabels);
  const isIncomplete = hasIncompleteSelectorLabels(selectorLabels);
  const isEmptySelectorLabels = isEmpty(selectorLabels);
  const hasNotChanged = isEqualObject(nodeSelector, idLabelsToNodeSelector(selectorLabels));

  const onSelectorLabelAdd = (): void => onLabelAdd({ id: null, key: '', value: '' });

  return (
    <TabModal
      headerText={t('Node selector')}
      isDisabled={hasNotChanged || isIncomplete}
      isOpen={isOpen}
      obj={updatedResource}
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
