import React from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import DynamicSSHKeyInjectionHelpTextIcon from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjectionHelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { dataSourceHasDynamicSSHLabel } from '../utils/utils';

const DynamicSSHKeyInjectionInstanceType = () => {
  const { t } = useKubevirtTranslation();
  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const { pvcSource, selectedBootableVolume, sshSecretCredentials } = instanceTypeVMState;

  const hasDynamicSSHLabel = dataSourceHasDynamicSSHLabel(pvcSource, selectedBootableVolume);
  const isDisabled = !sshSecretCredentials?.sshSecretName || !hasDynamicSSHLabel;

  return (
    <DescriptionItem
      descriptionData={
        <DynamicSSHKeyInjection
          onSubmit={(checked: boolean) => {
            setInstanceTypeVMState({
              payload: checked,
              type: instanceTypeActionType.setIsDynamicSSHInjection,
            });
          }}
          hasDynamicSSHLabel={Boolean(hasDynamicSSHLabel)}
          isDisabled={isDisabled}
        />
      }
      descriptionHeader={<>{t('Dynamic SSH key injection')}</>}
      label={<DynamicSSHKeyInjectionHelpTextIcon isDisabled={isDisabled} />}
    />
  );
};
export default DynamicSSHKeyInjectionInstanceType;
