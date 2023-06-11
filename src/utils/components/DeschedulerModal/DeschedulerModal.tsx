import * as React from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Checkbox, Form, FormGroup } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedDescheduler } from '../PendingChanges/utils/helpers';

type DeschedulerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DeschedulerModal: React.FC<DeschedulerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = React.useState<boolean>(
    vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL] === 'true',
  );

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, 'spec.template.metadata.annotations');
      if (!vmDraft.spec.template.metadata.annotations)
        vmDraft.spec.template.metadata.annotations = {};
      if (checked) {
        vmDraft.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL] = 'true';
      } else {
        delete vmDraft.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL];
      }
    });
    return updatedVM;
  }, [vm, checked]);

  return (
    <TabModal
      headerText={t('Descheduler settings')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedDescheduler(updatedVirtualMachine, vmi, checked)}
          />
        )}
        <FormGroup fieldId="descheduler">
          <Checkbox
            description={t('Allow the Descheduler to evict the VirtualMachine via live migration')}
            id="descheduler"
            isChecked={checked}
            label={t('Enable Descheduler')}
            onChange={setChecked}
          />
        </FormGroup>
        {checked && (
          <Alert isInline title={t('Active Descheduler')} variant={AlertVariant.info}>
            {t(
              'This VirtualMachine is subject to the Descheduler profiles configured for eviction.',
            )}
          </Alert>
        )}
      </Form>
    </TabModal>
  );
};

export default DeschedulerModal;
