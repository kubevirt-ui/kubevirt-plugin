import * as React from 'react';

import { ensurePath, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { UNATTEND } from '../../../utils/sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepUnattendHelperPopup from './SysprepUnattendHelperPopup';

const SysprepUnattend = () => {
  const { t } = useKubevirtTranslation();
  const { tabsData, updateTabsData } = useWizardVMContext();

  const onChange = (value: string) =>
    updateTabsData((tabDataDraft) => {
      ensurePath(tabDataDraft, 'scripts.sysprep');
      tabDataDraft.scripts.sysprep.unattended = value;
    });

  return (
    <>
      <div className="kv-sysprep--title">
        <Text component={TextVariants.h6}>{t('Unattend.xml answer file')}</Text>
        <SysprepUnattendHelperPopup />
      </div>
      <SysprepFileField
        id={UNATTEND}
        value={tabsData?.scripts?.sysprep?.unattended}
        onChange={onChange}
      />
    </>
  );
};

export default SysprepUnattend;
