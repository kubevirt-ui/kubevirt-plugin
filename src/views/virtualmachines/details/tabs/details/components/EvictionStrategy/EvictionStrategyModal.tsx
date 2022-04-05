import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

type EvictionStrategyModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  headerText: string;
};

const EvictionStrategyModal: React.FC<EvictionStrategyModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  headerText,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = React.useState<boolean>(
    !!vm?.spec?.template?.spec?.evictionStrategy,
  );

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      if (checked) {
        vmDraft.spec.template.spec.evictionStrategy = 'LiveMigrate';
      } else {
        delete vmDraft.spec.template.spec.evictionStrategy;
      }
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={headerText}
    >
      <Form>
        <FormGroup
          fieldId="eviction-strategy"
          helperText={t(
            'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
          )}
          isInline
        >
          <Checkbox
            id="eviction-strategy"
            isChecked={checked}
            onChange={setChecked}
            label={t('LiveMigrate')}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EvictionStrategyModal;
