import { type FC, useMemo, useState } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import DedicatedResourcesModalBody from './components/DedicatedResourcesModalBody';
import { produceVMWithDedicatedCPU } from './utils/utils';

type DedicatedResourcesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  showPendingChangesAlert?: boolean;
  vm: V1VirtualMachine;
};

const DedicatedResourcesModal: FC<DedicatedResourcesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  showPendingChangesAlert,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const initialChecked = !!getCPU(vm)?.dedicatedCpuPlacement;
  const [checked, setChecked] = useState<boolean>(initialChecked);

  const [nodes, loaded, loadError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const updatedVM = useMemo(() => produceVMWithDedicatedCPU(vm, checked), [vm, checked]);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Dedicated resources')}
      isDisabled={checked === initialChecked}
      isOpen={isOpen}
      obj={updatedVM}
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
