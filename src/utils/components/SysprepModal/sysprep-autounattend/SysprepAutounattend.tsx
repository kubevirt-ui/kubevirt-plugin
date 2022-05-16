import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { AUTOUNATTEND } from '../sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepAutounattendHelperPopup from './SysprepAutounattendHelperPopup';

const SysprepAutounattend: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <div className="kv-sysprep--title">
        <Text component={TextVariants.h6}>{t('Autounattend.xml answer file')}</Text>
        <SysprepAutounattendHelperPopup />
      </div>
      <SysprepFileField id={AUTOUNATTEND} value={value} onChange={onChange} />
    </>
  );
};

export default SysprepAutounattend;
