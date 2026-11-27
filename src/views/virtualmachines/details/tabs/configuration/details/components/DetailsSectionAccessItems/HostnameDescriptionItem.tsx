import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { updatedHostname } from '../../utils/utils';

type HostnameDescriptionItemProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  vmName: string;
};

const HostnameDescriptionItem: FC<HostnameDescriptionItemProps> = ({
  canUpdateVM,
  vm,
  vmi,
  vmName,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      data-test={`${vmName}-hostname`}
      descriptionData={
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string must fall back
        vm.spec?.template?.spec?.hostname || vmName
      }
      descriptionHeader={<SearchItem id="hostname">{t('Hostname')}</SearchItem>}
      isEdit={canUpdateVM}
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <HostnameModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={updatedHostname}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
    />
  );
};

export default HostnameDescriptionItem;
