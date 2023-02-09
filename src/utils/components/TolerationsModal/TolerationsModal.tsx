import * as React from 'react';
import produce from 'immer';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  K8sIoApiCoreV1Toleration,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTolerations } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { Form, ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedTolerations } from '../PendingChanges/utils/helpers';

import { TolerationLabel, TOLERATIONS_EFFECTS } from './utils/constants';
import { getNodeTaintQualifier } from './utils/helpers';
import TolerationEditRow from './TolerationEditRow';
import TolerationListHeaders from './TolerationListHeaders';
import TolerationModalDescriptionText from './TolerationModalDescriptionText';

type TolerationsModalProps = {
  vm?: V1VirtualMachine;
  nodes?: IoK8sApiCoreV1Node[];
  nodesLoaded?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const TolerationsModal: React.FC<TolerationsModalProps> = ({
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
    onTolerationAdd({ id: null, key: '', value: '', effect: TOLERATIONS_EFFECTS[0] });

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.template.spec.tolerations']);

      const updatedTolerations: K8sIoApiCoreV1Toleration[] = (tolerationsLabels || []).map(
        (toleration) => {
          return {
            ...toleration,
            operator: toleration?.value ? 'Equal' : Operator.Exists,
          };
        },
      );

      vmDraft.spec.template.spec.tolerations = updatedTolerations;
    });
    return updatedVM;
  }, [tolerationsLabels, vm]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Tolerations')}
      modalVariant={ModalVariant.medium}
    >
      <Stack hasGutter>
        <StackItem>
          {vmi && (
            <ModalPendingChangesAlert
              isChanged={getChangedTolerations(updatedVirtualMachine, vmi)}
            />
          )}
        </StackItem>
        <StackItem>
          <TolerationModalDescriptionText />
        </StackItem>
        <StackItem>
          <Form>
            <LabelsList
              isEmpty={tolerationLabelsEmpty}
              model={!isEmpty(nodes) && NodeModel}
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
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default TolerationsModal;
