import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCRIPTION_ANNOTATION, NAME_OS_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

import { printableVMStatus } from '../../../utils';
import { stopVM } from '../../actions';

import CloneRunningVMAlert from './components/CloneRunningVMAlert';
import ConfigurationSummary from './components/ConfigurationSummary';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import ProjectSelectInput from './components/ProjectSelectInput';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox';
import useCloneVMResources from './hooks/useCloneVMResources';
import { TEMPLATE_VM_NAME_LABEL } from './utils/constants';
import {
  produceCleanClonedVM,
  updateClonedDataVolumes,
  updateClonedPersistentVolumeClaims,
} from './utils/helpers';

type CloneVMModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const CloneVMModal: React.FC<CloneVMModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();

  const [cloneName, setCloneName] = React.useState(`${vm?.metadata?.name}-clone`);
  const [cloneDescription, setCloneDescription] = React.useState(
    vm?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
  );
  const [cloneProject, setCloneProject] = React.useState(vm?.metadata?.namespace);
  const [startCloneVM, setStartCloneVM] = React.useState(false);

  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  const { projects, pvcs, dataVolumes, loaded } = useCloneVMResources(vm);

  const projectNames = React.useMemo(
    () => (projects || [])?.map((project) => project.metadata.name),
    [projects],
  );

  const clonedVirtualMachine = React.useMemo(() => {
    const clonedVM = produceCleanClonedVM(vm, (draftVM) => {
      draftVM.metadata.name = cloneName;
      draftVM.metadata.namespace = cloneProject;
      draftVM.metadata.annotations[DESCRIPTION_ANNOTATION] = cloneDescription;
      draftVM.spec.running = startCloneVM;

      const osId = getOperatingSystem(vm);
      const osName = getOperatingSystemName(vm);

      if (osId && osName) {
        draftVM.metadata.annotations[`${NAME_OS_TEMPLATE_ANNOTATION}/${osId}`] = osName;
      }

      draftVM.spec.template.metadata.labels[TEMPLATE_VM_NAME_LABEL] = cloneName;

      // withClonedPVCs
      draftVM = updateClonedPersistentVolumeClaims(draftVM, pvcs);

      // withClonedDataVolumes
      draftVM = updateClonedDataVolumes(draftVM, dataVolumes, pvcs);
    });

    return clonedVM;
  }, [cloneDescription, cloneName, cloneProject, dataVolumes, pvcs, startCloneVM, vm]);

  const onClone = async (updatedVM: V1VirtualMachine) => {
    if (isVMRunning) {
      await stopVM(vm);
    }
    return await k8sCreate({ model: VirtualMachineModel, data: updatedVM });
  };

  return (
    <TabModal
      headerText={t('Clone VirtualMachine')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onClone}
      obj={clonedVirtualMachine}
    >
      <Form isHorizontal>
        <NameInput name={cloneName} setName={setCloneName} />
        <DescriptionInput description={cloneDescription} setDescription={setCloneDescription} />
        <ProjectSelectInput
          project={cloneProject}
          setProject={setCloneProject}
          projectNames={projectNames}
          projectsLoaded={loaded}
          vmNamespace={vm?.metadata?.namespace}
        />
        <StartClonedVMCheckbox startCloneVM={startCloneVM} setStartCloneVM={setStartCloneVM} />
        <ConfigurationSummary vm={vm} pvcs={pvcs} dataVolumes={dataVolumes} />
        <CloneRunningVMAlert vmName={vm?.metadata?.name} isVMRunning={isVMRunning} />
      </Form>
    </TabModal>
  );
};

export default CloneVMModal;
