import React, { FC, useState } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  ButtonVariant,
  Divider,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

import { AdvancedSearchInputs, AdvancedSearchQueryInputs } from '../../utils/types';

import ModalExpandableSection from './components/ModalExpandableSection';
import { DateSelectOption } from './constants/dateSelect';
import {
  initialHWDevices,
  initialMemory,
  initialScheduling,
  initialVCPU,
} from './constants/initialValues';
import ArchitectureField from './formFields/ArchitectureField';
import ClusterField from './formFields/ClusterField';
import CPUField from './formFields/CPUField';
import DateCreatedField from './formFields/DateCreatedField';
import DescriptionField from './formFields/DescriptionField';
import HardwareDevicesField from './formFields/HardwareDevicesField';
import IPField from './formFields/IPField';
import LabelsField from './formFields/LabelsField';
import MemoryField from './formFields/MemoryField';
import NameField from './formFields/NameField';
import NetworkAttachmentDefinitionsField from './formFields/NetworkAttachmentDefinitionsField';
import NodesField from './formFields/NodesField';
import OperatingSystemField from './formFields/OperatingSystemField';
import ProjectField from './formFields/ProjectField';
import SchedulingField from './formFields/SchedulingField';
import StatusField from './formFields/StatusField';
import StorageClassField from './formFields/StorageClassField';

import './advanced-search-modal.scss';

type AdvancedSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (searchInputs: AdvancedSearchQueryInputs) => void;
  prefillInputs?: AdvancedSearchInputs;
};

const AdvancedSearchModal: FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillInputs = {},
}) => {
  const { t } = useKubevirtTranslation();

  const [vms] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespaced: true,
  });

  const isACMPage = useIsACMPage();

  const [name, setName] = useState(prefillInputs.name ?? '');
  const [projects, setProjects] = useState(prefillInputs.project ?? []);
  const [clusters, setClusters] = useState(prefillInputs.cluster ?? []);
  const [description, setDescription] = useState(prefillInputs.description ?? '');
  const [statuses, setStatuses] = useState(prefillInputs.status ?? []);
  const [operatingSystems, setOperatingSystems] = useState(prefillInputs.os ?? []);
  const [labels, setLabels] = useState(prefillInputs.labels ?? []);
  const [ip, setIP] = useState(prefillInputs.ip ?? '');
  const [dateFromString, setDateFromString] = useState(prefillInputs.dateCreatedFrom ?? '');
  const [dateToString, setDateToString] = useState(prefillInputs.dateCreatedTo ?? '');
  const [vCPU, setVCPU] = useState(prefillInputs.cpu ?? initialVCPU);
  const [memory, setMemory] = useState(prefillInputs.memory ?? initialMemory);
  const [storageClasses, setStorageClasses] = useState(prefillInputs.storageClass ?? []);
  const [architectures, setArchitectures] = useState(prefillInputs.architecture ?? []);
  const [nodes, setNodes] = useState(prefillInputs.node ?? []);
  const [networkAttachmentDefinitions, setNetworkAttachmentDefinitions] = useState(
    prefillInputs.nad ?? [],
  );
  const [hardwareDevices, setHardwareDevices] = useState(
    prefillInputs.hwDevices ?? initialHWDevices,
  );
  const [scheduling, setScheduling] = useState(prefillInputs.scheduling ?? initialScheduling);

  const [dateOption, setDateOption] = useState<DateSelectOption | undefined>();
  const [isValidDate, setIsValidDate] = useState(true);

  const resetForm = () => {
    setName('');
    setProjects([]);
    setClusters([]);
    setDescription('');
    setStatuses([]);
    setOperatingSystems([]);
    setLabels([]);
    setIP('');
    setDateFromString('');
    setDateToString('');
    setDateOption(undefined);
    setVCPU(initialVCPU);
    setMemory(initialMemory);
    setStorageClasses([]);
    setArchitectures([]);
    setNodes([]);
    setNetworkAttachmentDefinitions([]);
    setHardwareDevices(initialHWDevices);
    setScheduling(initialScheduling);
    setIsValidDate(true);
  };

  const submitForm = () => {
    onSubmit({
      architecture: architectures,
      cluster: clusters,
      cpu: vCPU,
      dateCreatedFrom: dateFromString,
      dateCreatedTo: dateToString,
      description,
      hwDevices: hardwareDevices,
      ip,
      labels,
      memory,
      nad: networkAttachmentDefinitions,
      name,
      node: nodes,
      os: operatingSystems,
      project: projects,
      scheduling,
      status: statuses,
      storageClass: storageClasses,
    });
  };

  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={onClose}
      position="top"
      variant="medium"
    >
      <ModalHeader title={t('Advanced search')} />
      <ModalBody>
        <div data-test="adv-search-details">
          <ModalExpandableSection title={t('Details')}>
            <Form isHorizontal>
              <NameField name={name} setName={setName} />
              {isACMPage && <ClusterField clusters={clusters} setClusters={setClusters} />}
              <ProjectField projects={projects} setProjects={setProjects} />
              <DescriptionField description={description} setDescription={setDescription} />
              <StatusField setStatuses={setStatuses} statuses={statuses} />
              <OperatingSystemField
                operatingSystems={operatingSystems}
                setOperatingSystems={setOperatingSystems}
              />
              <CPUField setVCPU={setVCPU} vCPU={vCPU} />
              <MemoryField memory={memory} setMemory={setMemory} />
              <StorageClassField
                setStorageClasses={setStorageClasses}
                storageClasses={storageClasses}
                vms={vms}
              />
              <HardwareDevicesField hwDevices={hardwareDevices} setHWDevices={setHardwareDevices} />
              <DateCreatedField
                dateFromString={dateFromString}
                dateOption={dateOption}
                dateToString={dateToString}
                setDateFromString={setDateFromString}
                setDateOption={setDateOption}
                setDateToString={setDateToString}
                setIsValidDate={setIsValidDate}
              />
              <LabelsField
                initialInputValue={prefillInputs.labelInputText}
                labels={labels}
                setLabels={setLabels}
                vms={vms}
              />
              <SchedulingField scheduling={scheduling} setScheduling={setScheduling} />
              <NodesField nodes={nodes} setNodes={setNodes} />
              <ArchitectureField
                architectures={architectures}
                setArchitectures={setArchitectures}
                vms={vms}
              />
            </Form>
          </ModalExpandableSection>
        </div>
        <Divider className="pf-v6-u-my-md" />
        <div data-test="adv-search-network">
          <ModalExpandableSection isDefaultExpanded={false} title={t('Network')}>
            <Form isHorizontal>
              <IPField ip={ip} setIP={setIP} />
              <NetworkAttachmentDefinitionsField
                networkAttachmentDefinitions={networkAttachmentDefinitions}
                setNetworkAttachmentDefinitions={setNetworkAttachmentDefinitions}
              />
            </Form>
          </ModalExpandableSection>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={!isValidDate} onClick={submitForm}>
          {t('Search')}
        </Button>
        <Button onClick={resetForm} variant={ButtonVariant.secondary}>
          {t('Reset')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdvancedSearchModal;
