import React, { FC, useRef } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';

import { AdvancedSearchInputs, AdvancedSearchQueryInputs } from '../../utils/types';

import ModalExpandableSection from './components/ModalExpandableSection';
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
import { useAdvancedSearchActions, useIsSearchDisabled } from './store/useAdvancedSearchStore';

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

  const { resources: vms } = useAccessibleResources<V1VirtualMachine>(
    VirtualMachineModelGroupVersionKind,
  );

  const isACMPage = useIsACMPage();

  const isSearchDisabled = useIsSearchDisabled();
  const { getSearchQueryInputs, initializeWithPrefill, resetForm } = useAdvancedSearchActions();

  // Initialize store with prefill inputs when component mounts
  const hasInitialized = useRef(false);
  if (!hasInitialized.current) {
    initializeWithPrefill(prefillInputs);
    hasInitialized.current = true;
  }

  const submitForm = () => {
    onSubmit(getSearchQueryInputs());
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
              <NameField />
              {isACMPage && <ClusterField />}
              <ProjectField />
              <DescriptionField />
              <StatusField />
              <OperatingSystemField />
              <CPUField />
              <MemoryField />
              <StorageClassField vms={vms} />
              <HardwareDevicesField />
              <DateCreatedField />
              <LabelsField vms={vms} />
              <SchedulingField />
              <NodesField />
              <ArchitectureField vms={vms} />
            </Form>
          </ModalExpandableSection>
        </div>
        <Divider className="pf-v6-u-my-md" />
        <div data-test="adv-search-network">
          <ModalExpandableSection isDefaultExpanded={false} title={t('Network')}>
            <Form isHorizontal>
              <IPField />
              <NetworkAttachmentDefinitionsField />
            </Form>
          </ModalExpandableSection>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isSearchDisabled} onClick={submitForm}>
          {t('Search')}
        </Button>
        <Button onClick={resetForm} variant={ButtonVariant.secondary}>
          {t('Clear all')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdvancedSearchModal;
