import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { AUTOUNATTEND } from '../sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepAutounattendHelperPopup from './SysprepAutounattendHelperPopup';

const SysprepAutounattend: React.FC<{
  onChange: (value: string) => void;
  value: string;
}> = ({ onChange, value }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <div className="kv-sysprep--title">
        <Text component={TextVariants.h6}>{t('Autounattend.xml answer file')}</Text>
        <SysprepAutounattendHelperPopup />
      </div>
      <SysprepFileField id={AUTOUNATTEND} onChange={onChange} value={value} />
    </>
  );
};

export default SysprepAutounattend;
