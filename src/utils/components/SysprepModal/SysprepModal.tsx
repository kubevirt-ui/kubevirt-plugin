import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, FormGroup, ModalVariant } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import SelectSysprep from './SelectSysprep';
import Sysprep from './Sysprep';

export const SysprepModal: FC<{
  autoUnattend: string;
  enableCreation?: boolean;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onSysprepCreation?: (unattended: string, autoUnattend: string) => Promise<void> | void;
  onSysprepSelected?: (sysprepName: string) => Promise<void> | void;
  sysprepSelected?: string;
  unattend: string;
}> = ({
  autoUnattend: initialAutoUnattend,
  enableCreation = true,
  isOpen,
  namespace,
  onClose,
  onSysprepCreation,
  onSysprepSelected,
  sysprepSelected,
  unattend: initialUnattend,
}) => {
  const { t } = useKubevirtTranslation();
  const [autoUnattend, setAutoUnattend] = useState(initialAutoUnattend);
  const [unattend, setUnattend] = useState(initialUnattend);
  const [creationSectionOpen, setCreationSection] = useState(!sysprepSelected);
  const [selectedSysprepName, setSelectedSysprepName] = useState(sysprepSelected);

  const submitHandler = async () => {
    if (enableCreation && creationSectionOpen) {
      return await onSysprepCreation(unattend, autoUnattend);
    }

    if (onSysprepSelected) await onSysprepSelected(selectedSysprepName);
  };

  if (!enableCreation) {
    return (
      <TabModal
        headerText={t('Sysprep')}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => submitHandler()}
      >
        <div className="kv-sysprep-modal">
          <FormGroup fieldId="select-sysprep" label={t('Attach existing sysprep')}>
            <SelectSysprep
              namespace={namespace}
              onSelectSysprep={setSelectedSysprepName}
              selectedSysprepName={selectedSysprepName}
            />
          </FormGroup>
        </div>
      </TabModal>
    );
  }

  return (
    <TabModal
      headerText={t('Sysprep')}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      onClose={onClose}
      onSubmit={() => submitHandler()}
    >
      <div className="kv-sysprep-modal">
        <ExpandableSection
          data-test-id="expandable-new-sysprep-section"
          isExpanded={creationSectionOpen}
          isIndented
          onToggle={(_event, val) => setCreationSection(val)}
          toggleText={t('Create new sysprep')}
        >
          <Sysprep
            autoUnattend={autoUnattend}
            onAutoUnattendChange={setAutoUnattend}
            onUnattendChange={setUnattend}
            unattend={unattend}
          />
        </ExpandableSection>
        <ExpandableSection
          data-test-id="expandable-new-sysprep-section"
          isExpanded={!creationSectionOpen}
          isIndented
          onToggle={() => setCreationSection(!creationSectionOpen)}
          toggleText={t('Attach existing sysprep')}
        >
          <SelectSysprep
            namespace={namespace}
            onSelectSysprep={setSelectedSysprepName}
            selectedSysprepName={selectedSysprepName}
          />
        </ExpandableSection>
      </div>
    </TabModal>
  );
};
