import * as React from 'react';
import produce from 'immer';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { modelToGroupVersionKind, NodeModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { K8sIoApiCoreV1Toleration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import TolerationEditRow from '@kubevirt-utils/components/TolerationsModal/TolerationEditRow';
import TolerationListHeaders from '@kubevirt-utils/components/TolerationsModal/TolerationListHeaders';
import TolerationModalDescriptionText from '@kubevirt-utils/components/TolerationsModal/TolerationModalDescriptionText';
import {
  TolerationLabel,
  TOLERATIONS_EFFECTS,
} from '@kubevirt-utils/components/TolerationsModal/utils/constants';
import { getNodeTaintQualifier } from '@kubevirt-utils/components/TolerationsModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Form, ModalVariant } from '@patternfly/react-core';

type TolerationsModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
};

const TolerationsModal: React.FC<TolerationsModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: tolerationsLabels,
    onEntityAdd: onTolerationAdd,
    onEntityChange: onTolerationChange,
    onEntityDelete: onTolerationDelete,
  } = useIDEntities<TolerationLabel>(
    (getTolerations(template) || []).map((toleration, id) => ({ ...toleration, id })),
  );
  const tolerationLabelsEmpty = tolerationsLabels?.length === 0;
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const qualifiedNodes = getNodeTaintQualifier(nodes, nodesLoaded, tolerationsLabels);

  const onSelectorLabelAdd = () =>
    onTolerationAdd({ id: null, key: '', value: '', effect: TOLERATIONS_EFFECTS[0] });

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const updatedTolerations: K8sIoApiCoreV1Toleration[] = (tolerationsLabels || []).map(
        (toleration) => {
          return {
            ...toleration,
            operator: toleration?.value ? 'Equal' : Operator.Exists,
          };
        },
      );

      templateDraft.objects[0].spec.template.spec.tolerations = updatedTolerations;
    });
  }, [template, tolerationsLabels]);

  return (
    <TabModal
      obj={updatedTemplate}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Tolerations')}
      modalVariant={ModalVariant.medium}
      submitBtnText={t('Save')}
    >
      <TolerationModalDescriptionText />
      <Form>
        <LabelsList
          isEmpty={tolerationLabelsEmpty}
          model={NodeModel}
          onLabelAdd={onSelectorLabelAdd}
          addRowText={t('Add toleration')}
          emptyStateAddRowText={t('Add toleration to specify qualifying Nodes')}
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
            qualifiedNodes={tolerationsLabels?.length === 0 ? nodes : qualifiedNodes}
            nodesLoaded={nodesLoaded}
          />
        )}
      </Form>
    </TabModal>
  );
};

export default TolerationsModal;
