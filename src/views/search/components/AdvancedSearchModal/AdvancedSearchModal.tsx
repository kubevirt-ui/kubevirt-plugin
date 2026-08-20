import React, { type FC, useEffect, useRef } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
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

import { type AdvancedSearchInputs, type AdvancedSearchQueryInputs } from '../../utils/types';
import ModalExpandableSection from './components/ModalExpandableSection';
import ArchitectureField from './formFields/ArchitectureField';
import ClusterField from './formFields/ClusterField';
import CPUField from './formFields/CPUField';
import DateCreatedField from './formFields/DateCreatedField';
import DescriptionField from './formFields/DescriptionField';
import GroupField from './formFields/GroupField';
import GuestAgentField from './formFields/GuestAgentField';
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
  vms: V1VirtualMachine[];
};

const AdvancedSearchModal: FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillInputs = {},
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const isSearchDisabled = useIsSearchDisabled();
  const { getSearchQueryInputs, initializeWithPrefill, resetForm } = useAdvancedSearchActions();

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      initializeWithPrefill(prefillInputs);
      hasInitializedRef.current = true;
    }
  }, [initializeWithPrefill, prefillInputs]);

  const submitForm = (): void => {
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
        <div>
          <ModalExpandableSection title={t('Details')}>
            <Form isHorizontal>
              <NameField />
              {isACMPage && <ClusterField />}
              <ProjectField vms={vms} />
              {treeViewFoldersEnabled && <GroupField vms={vms} />}
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
              <GuestAgentField />
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
