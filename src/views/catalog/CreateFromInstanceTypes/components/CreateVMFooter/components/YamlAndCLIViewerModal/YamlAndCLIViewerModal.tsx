import React, { FC, KeyboardEvent, MouseEvent as ME, Suspense, useState } from 'react';
import { dump } from 'js-yaml';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Modal, ModalVariant, Tab, Tabs } from '@patternfly/react-core';

import YamlAndCLIEditor from '../YamlAndCLIEditor/YamlAndCLIEditor';

import { TAB } from './utils/constants';
import { getCreateVMVirtctlCommand } from './utils/utils';

type YamlAndCLIViewerModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const YamlAndCLIViewerModal: FC<YamlAndCLIViewerModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();

  const [activeTabKey, setActiveTabKey] = useState<TAB>(TAB.YAML);

  const { instanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedBootableVolume, vmName, sshSecretCredentials } = instanceTypeVMState;

  const handleTabClick = (event: ME<any> | KeyboardEvent | MouseEvent, tabIndex: TAB) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Modal
      title={`${activeTabKey} for ${vmName}`}
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Suspense fallback={<Loading />}>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          <Tab eventKey={TAB.YAML} title={t('YAML')}>
            <YamlAndCLIEditor code={dump(vm || '')} minHeight={350} />
          </Tab>
          <Tab eventKey={TAB.CLI} title={t('CLI')}>
            <YamlAndCLIEditor
              code={getCreateVMVirtctlCommand(
                vm,
                selectedBootableVolume,
                sshSecretCredentials?.sshPubKey,
              )}
              minHeight={150}
            />
          </Tab>
        </Tabs>
      </Suspense>
    </Modal>
  );
};

export default YamlAndCLIViewerModal;
