import { type FC, useMemo } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  K8sIoApiCoreV1TolerationEffectEnum,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getTolerations } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ModalVariant } from '@patternfly/react-core';
import { Stack, StackItem } from '@patternfly/react-core';

import { useIDEntities } from '../NodeSelectorModal/hooks/useIDEntities';
import TolerationEditRow from './TolerationEditRow';
import TolerationListHeaders from './TolerationListHeaders';
import TolerationModalDescriptionText from './TolerationModalDescriptionText';
import { type TolerationLabel } from './utils/constants';
import {
  getNodeTaintQualifier,
  getTolerationsModalSubmitTooltip,
  hasIncompleteTolerations,
  toK8sTolerations,
} from './utils/helpers';
import { produceVMWithTolerations } from './utils/utils';

type TolerationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  showPendingChangesAlert?: boolean;
  vm: V1VirtualMachine;
};

const TolerationsModal: FC<TolerationsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  showPendingChangesAlert,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const initialTolerations = useMemo(
    () =>
      toK8sTolerations((getTolerations(vm) ?? []).map((toleration, id) => ({ ...toleration, id }))),
    [vm],
  );
  const {
    entities: tolerationsLabels,
    onEntityAdd: onTolerationAdd,
    onEntityChange: onTolerationChange,
    onEntityDelete: onTolerationDelete,
  } = useIDEntities<TolerationLabel>(
    initialTolerations.map((toleration, id) => ({ ...toleration, id })),
  );

  const tolerationLabelsEmpty = isEmpty(tolerationsLabels);

  const tolerations = toK8sTolerations(tolerationsLabels);

  const updatedVM = useMemo(() => produceVMWithTolerations(vm, tolerations), [vm, tolerations]);

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const qualifiedNodes = getNodeTaintQualifier(nodes, tolerationsLabels);

  const onSelectorLabelAdd = (): void =>
    onTolerationAdd({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      id: null,
      key: '',
      value: '',
    });

  const isIncomplete = hasIncompleteTolerations(tolerationsLabels);
  const isDirty = !isEqualObject(tolerations, initialTolerations);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Tolerations')}
      isDisabled={!isDirty || isIncomplete}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedVM}
      onClose={onClose}
      onSubmit={onSubmit}
      submitDisabledTooltip={getTolerationsModalSubmitTooltip(isDirty, isIncomplete, t)}
    >
      <Stack hasGutter>
        <StackItem>{showPendingChangesAlert && <ModalPendingChangesAlert />} </StackItem>
        <StackItem>
          <TolerationModalDescriptionText />
        </StackItem>
        <StackItem>
          <div className="pf-v6-c-form">
            <LabelsList
              addRowText={t('Add toleration')}
              emptyStateAddRowText={t('Add toleration to specify qualifying Nodes')}
              isEmpty={tolerationLabelsEmpty}
              model={!isEmpty(nodes) ? NodeModel : undefined}
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
            {nodesLoaded && (
              <NodeCheckerAlert nodesLoaded={nodesLoaded} qualifiedNodes={qualifiedNodes} />
            )}
          </div>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default TolerationsModal;
