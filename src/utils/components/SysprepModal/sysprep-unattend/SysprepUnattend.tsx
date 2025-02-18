import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

import { UNATTEND } from '../sysprep-utils';
import SysprepFileField from '../SysprepFileField';

import SysprepUnattendHelperPopup from './SysprepUnattendHelperPopup';

const SysprepUnattend: React.FC<{
  onChange: (value: string) => void;
  value: string;
}> = ({ onChange, value }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <div className="kv-sysprep--title">
        <Content component={ContentVariants.h6}>{t('Unattend.xml answer file')}</Content>
        <SysprepUnattendHelperPopup />
      </div>
      <SysprepFileField id={UNATTEND} onChange={onChange} value={value} />
    </>
  );
};

export default SysprepUnattend;
