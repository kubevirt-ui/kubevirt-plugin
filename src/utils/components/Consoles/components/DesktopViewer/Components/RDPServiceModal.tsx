import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Checkbox, ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import { NODE_PORTS_LINK } from '../utils/constants';
import { createRDPService } from '../utils/utils';

type RDPServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const RDPServiceModal: React.FC<RDPServiceModalProps> = ({ isOpen, onClose, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setChecked] = React.useState<boolean>(false);

  return (
    <TabModal
      headerText={t('RDP Service')}
      isDisabled={!isChecked}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      onClose={onClose}
      onSubmit={() => createRDPService(vm, vmi)}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            className="kv-rdp-service-checkbox--main"
            data-checked-state={isChecked}
            id="rdp-service-checkbox"
            isChecked={isChecked}
            label={t('Expose RDP Service')}
            onChange={setChecked}
          />
        </StackItem>
        <StackItem>
          <Alert isInline title={t('Node port')} variant="info">
            <div>
              {t('RDP Service is using a node port. Node port requires additional port resources.')}
              <div>
                <ExternalLink href={NODE_PORTS_LINK} text={t('Learn more')} />
              </div>
            </div>
          </Alert>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default RDPServiceModal;
