import * as React from 'react';
import produce from 'immer';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import { modelToGroupVersionKind, NodeModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRow from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRow';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import { useNodeLabelQualifier } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useNodeLabelQualifier';
import {
  isEqualObject,
  nodeSelectorToIDLabels,
} from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

type NodeSelectorModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
};

const NodeSelectorModal: React.FC<NodeSelectorModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: selectorLabels,
    onEntityAdd: onLabelAdd,
    onEntityChange: onLabelChange,
    onEntityDelete: onLabelDelete,
  } = useIDEntities<IDLabel>(nodeSelectorToIDLabels(getNodeSelector(template)));

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const qualifiedNodes = useNodeLabelQualifier(nodes, nodesLoaded, selectorLabels);

  const onSelectorLabelAdd = () => onLabelAdd({ id: null, key: '', value: '' });

  const updatedTemplate = React.useMemo(
    () =>
      produce<V1Template>(template, (templateDraft: V1Template) => {
        const draftVM = getTemplateVirtualMachineObject(templateDraft);
        if (!getNodeSelector(templateDraft)) {
          draftVM.spec.template.spec.nodeSelector = {};
        }

        const k8sSelector: { [key: string]: string } = selectorLabels.reduce(
          (acc, { key, value }) => {
            acc[key] = value;
            return acc;
          },
          {},
        );

        if (!isEqualObject(getNodeSelector(templateDraft), k8sSelector)) {
          draftVM.spec.template.spec.nodeSelector = k8sSelector;
        }
      }),
    [template, selectorLabels],
  );

  return (
    <TabModal
      obj={updatedTemplate}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Node selector')}
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
            qualifiedNodes={selectorLabels?.length === 0 ? nodes : qualifiedNodes}
            nodesLoaded={nodesLoaded}
          />
        )}
      </Form>
    </TabModal>
  );
};

export default NodeSelectorModal;
