import * as React from 'react';
import produce from 'immer';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { modelToGroupVersionKind, NodeModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  K8sIoApiCoreV1Toleration,
  K8sIoApiCoreV1TolerationEffectEnum,
  K8sIoApiCoreV1TolerationOperatorEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import TolerationEditRow from '@kubevirt-utils/components/TolerationsModal/TolerationEditRow';
import TolerationListHeaders from '@kubevirt-utils/components/TolerationsModal/TolerationListHeaders';
import TolerationModalDescriptionText from '@kubevirt-utils/components/TolerationsModal/TolerationModalDescriptionText';
import { TolerationLabel } from '@kubevirt-utils/components/TolerationsModal/utils/constants';
import { getNodeTaintQualifier } from '@kubevirt-utils/components/TolerationsModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Form, ModalVariant } from '@patternfly/react-core';

type TolerationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const TolerationsModal: React.FC<TolerationsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
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
    onTolerationAdd({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      id: null,
      key: '',
      value: '',
    });

  const updatedTemplate = React.useMemo(
    () =>
      produce<V1Template>(template, (templateDraft: V1Template) => {
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

        getTemplateVirtualMachineObject(templateDraft).spec.template.spec.tolerations =
          updatedTolerations;
      }),
    [template, tolerationsLabels],
  );

  return (
    <TabModal
      headerText={t('Tolerations')}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <TolerationModalDescriptionText />
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
    </TabModal>
  );
};

export default TolerationsModal;
