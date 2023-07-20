import * as React from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

type EvictionStrategyModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const EvictionStrategyModal: React.FC<EvictionStrategyModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
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
      headerText={headerText}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup
          helperText={t(
            'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
          )}
          fieldId="eviction-strategy"
          isInline
        >
          <Checkbox
            id="eviction-strategy"
            isChecked={checked}
            label={t('LiveMigrate')}
            onChange={setChecked}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EvictionStrategyModal;
