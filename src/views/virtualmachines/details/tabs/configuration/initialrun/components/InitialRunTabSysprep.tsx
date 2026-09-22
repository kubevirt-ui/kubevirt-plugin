import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { getSysprepConfigMapName } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { type PatchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { getCluster } from '@multicluster/helpers/selectors';

import { createSysprepConfigMap, patchVMWithExistingSysprepConfigMap } from '../utils/utils';

type InitialRunTabSysprepProps = {
  canUpdateVM: boolean;
  onSubmit?: PatchCustomizeWizardVMSignal;
  vm: V1VirtualMachine;
};
const InitialRunTabSysprep: FC<InitialRunTabSysprepProps> = ({ canUpdateVM, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmVolumes = getVolumes(vm);
  const cluster = getCluster(vm);

  const currentSysprepVolume = vmVolumes?.find(getSysprepConfigMapName);
  const currentVMSysprepName = getSysprepConfigMapName(currentSysprepVolume);

  const onSysprepSelected = (name: string): Promise<void> =>
    patchVMWithExistingSysprepConfigMap(name, vm, onSubmit);

  const onSysprepCreation = async (unattended: string, autounattend: string): Promise<void> =>
    createSysprepConfigMap(unattended, autounattend, vm, onSubmit);

  return (
    <DescriptionItem
      data-test="sysprep-button"
      descriptionData={
        <SysprepDescription
          cluster={cluster}
          namespace={getNamespace(vm)}
          selectedSysprepName={currentVMSysprepName}
        />
      }
      descriptionHeader={<SearchItem id="sysprep">{t('Sysprep')}</SearchItem>}
      isDisabled={!canUpdateVM}
      isEdit={canUpdateVM}
      label={<WindowsLabel />}
      onEditClick={() =>
        createModal((modalProps) => (
          <SysprepModal
            {...modalProps}
            cluster={cluster}
            namespace={getNamespace(vm)}
            onSysprepCreation={onSysprepCreation}
            onSysprepSelected={onSysprepSelected}
            sysprepSelected={currentVMSysprepName}
          />
        ))
      }
      showEditOnTitle
    />
  );
};
export default InitialRunTabSysprep;
