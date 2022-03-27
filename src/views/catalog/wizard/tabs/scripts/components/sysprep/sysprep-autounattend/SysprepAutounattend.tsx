import * as React from 'react';

import { ensurePath, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { AUTOUNATTEND } from '../../../utils/sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepAutounattendHelperPopup from './SysprepAutounattendHelperPopup';

const SysprepAutounattend = () => {
  const { t } = useKubevirtTranslation();
  const { tabsData, updateTabsData } = useWizardVMContext();

  const onChange = (value: string) =>
    updateTabsData((tabDataDraft) => {
      ensurePath(tabDataDraft, 'scripts.sysprep');
      tabDataDraft.scripts.sysprep.autounattend = value;
    });

  return (
    <>
      <div className="kv-sysprep--title">
        <Text component={TextVariants.h6}>{t('Autounattend.xml answer file')}</Text>
        <SysprepAutounattendHelperPopup />
      </div>
      <SysprepFileField
        id={AUTOUNATTEND}
        value={tabsData?.scripts?.sysprep?.autounattend}
        onChange={onChange}
      />
    </>
  );
};

export default SysprepAutounattend;
