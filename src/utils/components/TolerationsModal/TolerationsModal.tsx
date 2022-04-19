import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { K8sIoApiCoreV1Toleration, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTolerations } from '@kubevirt-utils/resources/vm';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { Form, ModalVariant } from '@patternfly/react-core';

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
};

const TolerationsModal: React.FC<TolerationsModalProps> = ({
  vm,
  nodes,
  nodesLoaded,
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
    (getTolerations(vm) || []).map((toleration, id) => ({ ...toleration, id })),
  );

  const tolerationLabelsEmpty = tolerationsLabels?.length === 0;

  const qualifiedNodes = getNodeTaintQualifier(nodes, nodesLoaded, tolerationsLabels);

  const onSelectorLabelAdd = () =>
    onTolerationAdd({ id: null, key: '', value: '', effect: TOLERATIONS_EFFECTS[0] });

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.template.spec.tolerations']);
      if (!vmDraft.spec.template.spec.tolerations) {
        vmDraft.spec.template.spec.tolerations = [];
      }

      const updatedTolerations: K8sIoApiCoreV1Toleration[] = tolerationsLabels.map((toleration) => {
        return {
          ...toleration,
          operator: toleration?.value ? Operator.Equals : Operator.Exists,
        };
      });

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
