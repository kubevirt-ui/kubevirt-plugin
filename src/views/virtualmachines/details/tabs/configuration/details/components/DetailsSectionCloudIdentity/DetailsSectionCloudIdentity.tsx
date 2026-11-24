import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  CloudIdentityDescription,
  CloudIdentityModal,
  getCloudIdentityProvider,
} from '@kubevirt-utils/components/CloudIdentity';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DetailsSectionCloudIdentityProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionCloudIdentity: FC<DetailsSectionCloudIdentityProps> = ({
  canUpdateVM,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const provider = getCloudIdentityProvider();

  if (!provider) return null;

  return (
    <DescriptionItem
      descriptionData={<CloudIdentityDescription provider={provider} vm={vm} />}
      descriptionHeader={<SearchItem id="cloud-identity">{t('Cloud identity')}</SearchItem>}
      isEdit={canUpdateVM}
      messageOnDisabled={t("You don't have permission to update this virtual machine")}
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <CloudIdentityModal
            isOpen={isOpen}
            onClose={onClose}
            provider={provider}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
    />
  );
};

export default DetailsSectionCloudIdentity;
