import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import {
  CloudIdentityDescription,
  type CloudIdentityFormValues,
  CloudIdentityModal,
  getCloudIdentityProvider,
  getCloudIdentityServiceAccountName,
  updateCloudIdentityVM,
} from '@kubevirt-utils/components/CloudIdentity';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type VMWizardPendingCloudIdentity } from '@virtualmachines/wizard/form/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const WizardCloudIdentity: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { control, setValue } = useVMWizardForm();
  const { replaceDraft, vmDraft } = useWizardVMDraft();

  const vm = vmDraft as NonNullable<typeof vmDraft>;

  const [cluster, namespace, pendingCloudIdentity] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project', 'customization.pendingCloudIdentity'],
  });

  const provider = getCloudIdentityProvider();

  if (!provider) return null;

  const handleSubmit = async (values: CloudIdentityFormValues): Promise<void> => {
    const updatedVM = updateCloudIdentityVM(vm, {
      provider,
      serviceAccountName: getCloudIdentityServiceAccountName(values),
    });

    if (!replaceDraft(updatedVM, vm)) return;

    const pendingIdentity: null | VMWizardPendingCloudIdentity =
      values.serviceAccountSource === 'new'
        ? { provider, values: { ...values, serviceAccountSource: 'new' } }
        : null;

    setValue('customization.pendingCloudIdentity', pendingIdentity, {
      shouldDirty: true,
    });
  };

  const handleDetach = async (): Promise<void> => {
    if (!replaceDraft(updateCloudIdentityVM(vm), vm)) return;

    setValue('customization.pendingCloudIdentity', null, {
      shouldDirty: true,
    });
  };

  return (
    <DescriptionItem
      descriptionData={<CloudIdentityDescription provider={provider} vm={vm} />}
      descriptionHeader={<SearchItem id="cloud-identity">{t('Cloud identity')}</SearchItem>}
      isEdit
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <CloudIdentityModal
            cluster={cluster}
            initialValues={pendingCloudIdentity?.values}
            isOpen={isOpen}
            namespace={namespace}
            onClose={onClose}
            onDetach={handleDetach}
            onSubmit={handleSubmit}
            provider={provider}
            vm={vm}
          />
        ))
      }
    />
  );
};

export default WizardCloudIdentity;
