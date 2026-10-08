import { type ReactNode, useState } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import DedicatedResourcesModalBody from './components/DedicatedResourcesModalBody';

type DedicatedResourcesModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  initialChecked: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedResource: T) => Promise<T | void>;
  produceUpdatedResource: (checked: boolean) => T;
  showPendingChangesAlert?: boolean;
};

const DedicatedResourcesModal = <T extends K8sResourceCommon>({
  initialChecked,
  isOpen,
  onClose,
  onSubmit,
  produceUpdatedResource,
  showPendingChangesAlert,
}: DedicatedResourcesModalProps<T>): ReactNode => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = useState<boolean>(initialChecked);

  const updatedResource = produceUpdatedResource(checked);

  const cluster = getCluster(updatedResource);

  const [nodes, loaded, loadError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  return (
    <TabModal<T>
      headerText={t('Dedicated resources')}
      isDisabled={checked === initialChecked}
      isOpen={isOpen}
      obj={updatedResource}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      {showPendingChangesAlert && <ModalPendingChangesAlert />}
      <DedicatedResourcesModalBody
        checked={checked}
        cluster={cluster}
        loadError={loadError}
        nodes={nodes}
        nodesLoaded={loaded}
        onCheckedChange={setChecked}
      />
    </TabModal>
  );
};

export default DedicatedResourcesModal;
