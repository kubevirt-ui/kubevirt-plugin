import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, FormGroup, ModalVariant } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import SelectSysprep from './SelectSysprep';
import Sysprep from './Sysprep';

export const SysprepModal: React.FC<{
  isOpen: boolean;
  autoUnattend: string;
  unattend: string;
  onSysprepCreation?: (unattended: string, autoUnattend: string) => void | Promise<void>;
  onClose: () => void;
  enableCreation?: boolean;
  onSysprepSelected?: (sysprepName: string) => void | Promise<void>;
  sysprepSelected?: string;
}> = ({
  isOpen,
  onClose,
  autoUnattend: initialAutoUnattend,
  unattend: initialUnattend,
  onSysprepCreation,
  enableCreation = true,
  onSysprepSelected,
  sysprepSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [autoUnattend, setAutoUnattend] = React.useState(initialAutoUnattend);
  const [unattend, setUnattend] = React.useState(initialUnattend);
  const [creationSectionOpen, setCreationSection] = React.useState(!sysprepSelected);
  const [selectedSysprepName, setSelectedSysprepName] = React.useState(sysprepSelected);

  const submitHandler = async () => {
    if (enableCreation && creationSectionOpen) {
      return await onSysprepCreation(unattend, autoUnattend);
    }

    if (onSysprepSelected) await onSysprepSelected(selectedSysprepName);
  };

  if (!enableCreation) {
    return (
      <TabModal
        onSubmit={() => submitHandler()}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Sysprep')}
      >
        <div className="kv-sysprep-modal">
          <FormGroup fieldId="select-sysprep" label={t('Attach existing sysprep')}>
            <SelectSysprep
              selectedSysprepName={selectedSysprepName}
              onSelectSysprep={setSelectedSysprepName}
            />
          </FormGroup>
        </div>
      </TabModal>
    );
  }

  return (
    <TabModal
      onSubmit={() => submitHandler()}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Sysprep')}
      modalVariant={ModalVariant.medium}
    >
      <div className="kv-sysprep-modal">
        <ExpandableSection
          onToggle={setCreationSection}
          toggleText={t('Create new sysprep')}
          data-test-id="expandable-new-sysprep-section"
          isExpanded={creationSectionOpen}
          isIndented
        >
          <Sysprep
            autoUnattend={autoUnattend}
            onAutoUnattendChange={setAutoUnattend}
            unattend={unattend}
            onUnattendChange={setUnattend}
          />
        </ExpandableSection>
        <ExpandableSection
          onToggle={() => setCreationSection(!creationSectionOpen)}
          toggleText={t('Attach existing sysprep')}
          data-test-id="expandable-new-sysprep-section"
          isExpanded={!creationSectionOpen}
          isIndented
        >
          <SelectSysprep
            selectedSysprepName={selectedSysprepName}
            onSelectSysprep={setSelectedSysprepName}
          />
        </ExpandableSection>
      </div>
    </TabModal>
  );
};
