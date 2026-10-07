import { type FC, useMemo, useState } from 'react';
import produce from 'immer';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { K8sIoApiCoreV1TolerationEffectEnum } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import TolerationEditRow from '@kubevirt-utils/components/TolerationsModal/TolerationEditRow';
import TolerationListHeaders from '@kubevirt-utils/components/TolerationsModal/TolerationListHeaders';
import TolerationModalDescriptionText from '@kubevirt-utils/components/TolerationsModal/TolerationModalDescriptionText';
import { type TolerationLabel } from '@kubevirt-utils/components/TolerationsModal/utils/constants';
import {
  getNodeTaintQualifier,
  getTolerationsModalSubmitTooltip,
  hasIncompleteTolerations,
  toK8sTolerations,
} from '@kubevirt-utils/components/TolerationsModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ModalVariant, Stack, StackItem } from '@patternfly/react-core';

type TolerationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: Template) => Promise<Template | void>;
  template: Template;
};

const TolerationsModal: FC<TolerationsModalProps> = ({ isOpen, onClose, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const [initialTolerations] = useState(() =>
    toK8sTolerations(
      (getTolerations(template) ?? []).map((toleration, id) => ({ ...toleration, id })),
    ),
  );
  const {
    entities: tolerationsLabels,
    onEntityAdd: onTolerationAdd,
    onEntityChange: onTolerationChange,
    onEntityDelete: onTolerationDelete,
  } = useIDEntities<TolerationLabel>(
    initialTolerations.map((toleration, id) => ({ ...toleration, id })),
  );
  const tolerationLabelsEmpty = tolerationsLabels?.length === 0;

  const tolerations = toK8sTolerations(tolerationsLabels);

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(template),
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const qualifiedNodes = getNodeTaintQualifier(nodes, nodesLoaded, tolerationsLabels);

  const onSelectorLabelAdd = (): void =>
    onTolerationAdd({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      id: null,
      key: '',
      value: '',
    });

  const updatedTemplate = useMemo(
    () =>
      produce<Template>(template, (templateDraft: Template) => {
        const draftVM = getTemplateVirtualMachineObject(templateDraft);
        ensurePath(draftVM, 'spec.template.spec.tolerations');
        draftVM.spec.template.spec.tolerations = tolerations;
      }),
    [template, tolerations],
  );

  const isIncomplete = hasIncompleteTolerations(tolerationsLabels);
  const isDirty = !isEqualObject(tolerations, initialTolerations);

  return (
    <TabModal
      headerText={t('Tolerations')}
      isDisabled={!isDirty || isIncomplete}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
      submitDisabledTooltip={getTolerationsModalSubmitTooltip(isDirty, isIncomplete, t)}
    >
      <Stack hasGutter>
        <StackItem>
          <TolerationModalDescriptionText />
        </StackItem>
        <StackItem>
          <div className="pf-v6-c-form">
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
          </div>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default TolerationsModal;
