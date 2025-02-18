import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

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
        <Content component={ContentVariants.h6}>{t('Autounattend.xml answer file')}</Content>
        <SysprepAutounattendHelperPopup />
      </div>
      <SysprepFileField id={AUTOUNATTEND} onChange={onChange} value={value} />
    </>
  );
};

export default SysprepAutounattend;
