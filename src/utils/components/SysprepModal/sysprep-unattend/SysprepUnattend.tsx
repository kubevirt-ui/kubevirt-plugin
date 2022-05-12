import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { UNATTEND } from '../sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepUnattendHelperPopup from './SysprepUnattendHelperPopup';

const SysprepUnattend: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <div className="kv-sysprep--title">
        <Text component={TextVariants.h6}>{t('Unattend.xml answer file')}</Text>
        <SysprepUnattendHelperPopup />
      </div>
      <SysprepFileField id={UNATTEND} value={value} onChange={onChange} />
    </>
  );
};

export default SysprepUnattend;
