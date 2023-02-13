import * as React from 'react';

import { produceVMSysprep, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  AUTOUNATTEND,
  removeSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import {
  editSysprepObject,
  isSysprepConfig,
  pushSysprepObject,
  removeSysprepObject,
} from './sysprep-utils';
import { SysprepDescription } from './SysprepDescription';

const Sysprep: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const { createModal } = useModal();
  const { vm, updateVM, tabsData, updateTabsData } = useWizardVMContext();

  const currentSysprepVolume = getVolumes(vm)?.find((volume) => volume?.sysprep?.configMap?.name);
  const currentVMSysprepName = currentSysprepVolume?.sysprep?.configMap?.name;

  const filterSysprepByName = isSysprepConfig(currentVMSysprepName);

  const sysPrepObject = tabsData?.additionalObjects?.find(
    filterSysprepByName,
  ) as IoK8sApiCoreV1ConfigMap;

  const { [UNATTEND]: unattend, [AUTOUNATTEND]: autoUnattend } = sysPrepObject?.data || {};
  const selectedSysprep = !sysPrepObject && currentVMSysprepName;

  const onSysprepSelected = (newSysprep: string) => {
    updateTabsData((tabsDraft) => {
      tabsDraft.additionalObjects = (tabsDraft?.additionalObjects || []).filter(
        (object) => !filterSysprepByName(object),
      );
    });

    return updateVM((vmDraft) => {
      if (currentSysprepVolume) removeSysprepConfig(vmDraft, currentSysprepVolume.name);

      if (newSysprep) {
        const produced = produceVMSysprep(vmDraft, newSysprep);
        vmDraft.spec = produced.spec;
      }
    });
  };

  const onSysprepCreation = (unattended: string, autounattend: string) => {
    if (!unattended && !autounattend) {
      return removeSysprepObject(updateVM, updateTabsData, currentVMSysprepName);
    }

    const sysprepName =
      sysPrepObject?.metadata?.name || `sysprep-${vm?.metadata?.name}-${getRandomChars()}`;
    const sysprepData = { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended };

    if (sysPrepObject) {
      editSysprepObject(updateTabsData, sysprepName, sysprepData);
    } else {
      pushSysprepObject(vm, updateTabsData, sysprepData, sysprepName);
    }

    return updateVM((vmDraft) => {
      if (currentSysprepVolume) removeSysprepConfig(vmDraft, currentSysprepVolume.name);
      const produced = produceVMSysprep(vmDraft, sysprepName);
      vmDraft.spec = produced.spec;
    });
  };

  return (
    <WizardDescriptionItem
      testId="wizard-sysprep"
      title={t('Sysprep')}
      description={
        <SysprepDescription
          hasAutoUnattend={!!autoUnattend}
          hasUnattend={!!unattend}
          selectedSysprepName={selectedSysprep}
        />
      }
      isEdit
      showEditOnTitle
      onEditClick={() =>
        createModal((modalProps) => (
          <SysprepModal
            {...modalProps}
            namespace={vm?.metadata?.namespace}
            unattend={unattend}
            autoUnattend={autoUnattend}
            onSysprepCreation={onSysprepCreation}
            onSysprepSelected={onSysprepSelected}
            sysprepSelected={selectedSysprep}
          />
        ))
      }
    />
  );
};

export default Sysprep;
