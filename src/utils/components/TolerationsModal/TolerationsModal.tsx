import { type FC, useMemo } from 'react';
import produce from 'immer';

import { NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  K8sIoApiCoreV1TolerationEffectEnum,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTolerations } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import TolerationEditRow from './TolerationEditRow';
import TolerationListHeaders from './TolerationListHeaders';
import TolerationModalDescriptionText from './TolerationModalDescriptionText';
import { type TolerationLabel } from './utils/constants';
import {
  getIncompleteTolerationsTooltip,
  getNodeTaintQualifier,
  hasIncompleteTolerations,
  toK8sTolerations,
} from './utils/helpers';

type TolerationsModalProps = {
  isOpen: boolean;
  nodes?: IoK8sApiCoreV1Node[];
  nodesLoaded?: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const TolerationsModal: FC<TolerationsModalProps> = ({
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
    (getTolerations(vm) ?? []).map((toleration, id) => ({ ...toleration, id })),
  );

  const tolerationLabelsEmpty = tolerationsLabels?.length === 0;

  const qualifiedNodes = getNodeTaintQualifier(nodes, nodesLoaded, tolerationsLabels);

  const onSelectorLabelAdd = (): void =>
    onTolerationAdd({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      id: null,
      key: '',
      value: '',
    });

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, 'spec.template.spec.tolerations');

      vmDraft.spec.template.spec.tolerations = toK8sTolerations(tolerationsLabels);
    });
    return updatedVM;
  }, [tolerationsLabels, vm]);

  const isIncomplete = hasIncompleteTolerations(tolerationsLabels);

  return (
    <TabModal
      headerText={t('Tolerations')}
      isDisabled={isIncomplete}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      submitDisabledTooltip={getIncompleteTolerationsTooltip(isIncomplete, t)}
    >
      <Stack hasGutter>
        <StackItem>{vmi && <ModalPendingChangesAlert />}</StackItem>
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
