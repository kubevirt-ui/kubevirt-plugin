import { type ReactNode, useState } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { K8sIoApiCoreV1TolerationEffectEnum } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type K8sIoApiCoreV1Toleration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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

type TolerationsModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  initialTolerationsProp?: K8sIoApiCoreV1Toleration[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedResource: T) => Promise<T | void>;
  produceUpdatedResource: (tolerations: K8sIoApiCoreV1Toleration[]) => T;
  showPendingChangesAlert?: boolean;
};

const TolerationsModal = <T extends K8sResourceCommon>({
  initialTolerationsProp = [],
  isOpen,
  onClose,
  onSubmit,
  produceUpdatedResource,
  showPendingChangesAlert,
}: TolerationsModalProps<T>): ReactNode => {
  const { t } = useKubevirtTranslation();

  const [initialTolerations] = useState(() =>
    toK8sTolerations(initialTolerationsProp.map((toleration, id) => ({ ...toleration, id }))),
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

  const updatedResource = produceUpdatedResource(tolerations);

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(updatedResource),
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
    <TabModal<T>
      headerText={t('Tolerations')}
      isDisabled={!isDirty || isIncomplete}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedResource}
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
