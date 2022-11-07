import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Checkbox, ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import { NODE_PORTS_LINK } from '../utils/constants';
import { createRDPService } from '../utils/utils';

type RDPServiceModalProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const RDPServiceModal: React.FC<RDPServiceModalProps> = ({ vmi, vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setChecked] = React.useState<boolean>(false);

  return (
    <TabModal
      isOpen={isOpen}
      isDisabled={!isChecked}
      onClose={onClose}
      onSubmit={() => createRDPService(vm, vmi)}
      headerText={t('RDP Service')}
      modalVariant={ModalVariant.medium}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="rdp-service-checkbox"
            className="kv-rdp-service-checkbox--main"
            label={t('Expose RDP Service')}
            isChecked={isChecked}
            data-checked-state={isChecked}
            onChange={setChecked}
          />
        </StackItem>
        <StackItem>
          <Alert variant="info" isInline title={t('Node port')}>
            <div>
              {t('RDP Service is using a node port. Node port requires additional port resources.')}
              <div>
                <ExternalLink text={t('Learn more')} href={NODE_PORTS_LINK} />
              </div>
            </div>
          </Alert>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default RDPServiceModal;
