import React, { FC } from 'react';

import { produceVMSysprep, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  AUTOUNATTEND,
  getSysprepConfigMapName,
  removeSysprepConfig,
  UNATTEND,
  WINDOWS,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
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

const Sysprep: FC = () => {
  const { t } = useKubevirtTranslation();

  const { createModal } = useModal();
  const { tabsData, updateTabsData, updateVM, vm } = useWizardVMContext();

  const currentSysprepVolume = getVolumes(vm)?.find((volume) => volume?.sysprep?.configMap?.name);
  const currentVMSysprepName = getSysprepConfigMapName(currentSysprepVolume);

  const filterSysprepByName = isSysprepConfig(currentVMSysprepName);

  const sysPrepObject = tabsData?.additionalObjects?.find(
    filterSysprepByName,
  ) as IoK8sApiCoreV1ConfigMap;

  const { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend } = sysPrepObject?.data || {};
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
      onEditClick={() =>
        createModal((modalProps) => (
          <SysprepModal
            {...modalProps}
            autoUnattend={autoUnattend}
            namespace={vm?.metadata?.namespace}
            onSysprepCreation={onSysprepCreation}
            onSysprepSelected={onSysprepSelected}
            sysprepSelected={selectedSysprep}
            unattend={unattend}
          />
        ))
      }
      description={<SysprepDescription loaded selectedSysprepName={currentVMSysprepName} />}
      isDisabled={tabsData?.overview?.templateMetadata?.osType !== WINDOWS}
      isEdit
      label={<WindowsLabel />}
      showEditOnTitle
      testId="wizard-sysprep"
      title={t('Sysprep')}
    />
  );
};

export default Sysprep;
