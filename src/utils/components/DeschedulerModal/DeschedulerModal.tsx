import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { Alert, AlertVariant, Checkbox, Form, FormGroup } from '@patternfly/react-core';

type DeschedulerModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
};

const DeschedulerModal: React.FC<DeschedulerModalProps> = ({ vm, isOpen, onClose, onSubmit }) => {
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
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Descheduler settings')}
    >
      <Form>
        <FormGroup fieldId="descheduler">
          <Checkbox
            id="descheduler"
            isChecked={checked}
            onChange={setChecked}
            label={t('Allow the Descheduler to evict the VM via live migration')}
            description={t('Allow the Descheduler to evict the VM via live migration')}
          />
        </FormGroup>
        {checked && (
          <Alert isInline variant={AlertVariant.info} title={t('Active descheduler')}>
            {t('This VM is subject to the descheduler profiles configured for eviction.')}
          </Alert>
        )}
      </Form>
    </TabModal>
  );
};

export default DeschedulerModal;
