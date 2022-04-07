import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { FilterPVCSelect as FilterProjectsSelect } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/Filters';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  DESCRIPTION_ANNOTATION,
  getInterfaces,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { k8sCreate, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Checkbox,
  Form,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  TextArea,
  TextInput,
  TextListItem,
  TextListItemVariants,
} from '@patternfly/react-core';

import Flavor from '../../../details/tabs/details/components/Flavor/Flavor';
import { printableVMStatus } from '../../../utils';

import useProjectsAndDVsAndPVCs from './hooks/useProjectsAndDVsAndPVCs';
import { getDisksDescription, getName } from './utils/helpers';

type CloneVMModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const CloneVMModal: React.FC<CloneVMModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = vm?.status?.printableStatus !== printableVMStatus.Stopped;

  const { projects, pvcs, dataVolumes, loaded } = useProjectsAndDVsAndPVCs(vm);

  const projectNames = React.useMemo(
    () => (projects || [])?.map((project) => project.metadata.name),
    [projects],
  );
  const [cloneName, setCloneName] = React.useState(`${vm?.metadata?.name}-clone`);
  const [cloneDescription, setCloneDescription] = React.useState(
    vm?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
  );
  const [cloneNamespace, setCloneNamespace] = React.useState(vm?.metadata?.namespace);
  const [isNamespaceOpen, setIsNamespaceOpen] = React.useState(false);
  const [startCloneVM, setStartCloneVM] = React.useState(false);

  const onSelect = React.useCallback((event, selection) => {
    setCloneNamespace(selection);
    setIsNamespaceOpen(false);
  }, []);

  return (
    <TabModal
      headerText={t('Clone VirtualMachine')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(updatedVM) => k8sCreate({ model: VirtualMachineModel, data: updatedVM })}
      obj={vm}
    >
      <Form isHorizontal>
        <FormGroup label={t('Name')} fieldId="name" isRequired>
          <TextInput type="text" value={cloneName} onChange={setCloneName} id="name" />
        </FormGroup>
        <FormGroup label={t('Description')} fieldId="description" isRequired>
          <TextArea
            type="text"
            value={cloneDescription}
            onChange={setCloneDescription}
            id="description"
          />
        </FormGroup>
        <FormGroup label={t('Namespace')} fieldId="namespace" isRequired>
          {loaded ? (
            <Select
              menuAppendTo="parent"
              id="namespace"
              isOpen={isNamespaceOpen}
              onToggle={setIsNamespaceOpen}
              onSelect={onSelect}
              variant={SelectVariant.single}
              onFilter={FilterProjectsSelect(projectNames)}
              hasInlineFilter
              selections={cloneNamespace}
              maxHeight={400}
            >
              {projectNames.map((projectName) => (
                <SelectOption key={projectName} value={projectName}>
                  <ResourceLink kind={ProjectModel.kind} name={projectName} linkTo={false} />
                </SelectOption>
              ))}
            </Select>
          ) : (
            <Loading />
          )}
        </FormGroup>
        <FormGroup hasNoPaddingTop label={t('Start cloned VM')} fieldId="start-clone">
          <Checkbox
            id="start-clone"
            label={t('Start VirtualMachine on clone')}
            isChecked={startCloneVM}
            onChange={setStartCloneVM}
          />
        </FormGroup>
        <FormGroup hasNoPaddingTop label={t('Configuration')} fieldId="configuration">
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Operating System')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {getOperatingSystemName(vm) || getOperatingSystem(vm)}
          </TextListItem>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Flavor')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <Flavor vm={vm} />
          </TextListItem>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Workload Profile')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextSpan text={t('Not available')} />
            )}
          </TextListItem>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('NICs')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {(getInterfaces(vm) || []).map(({ name, model }) => (
              <div key={name}>{model ? `${name} - ${model}` : name}</div>
            ))}
          </TextListItem>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Disks')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {getDisksDescription(vm, pvcs, dataVolumes)}
          </TextListItem>
        </FormGroup>
        {isVMRunning && (
          <Alert
            title={t('The VM {{vmName}} is still running. It will be powered off while cloning.', {
              vmName: getName(vm),
            })}
            variant={AlertVariant.warning}
            isInline
          />
        )}
      </Form>
    </TabModal>
  );
};

export default CloneVMModal;
