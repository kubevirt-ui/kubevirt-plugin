import React, { Dispatch, FC, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SelectOption } from '@patternfly/react-core';

import { getBooleanText } from '../../../../utils/utils';

type YesNoDropdownProps = {
  setState: Dispatch<SetStateAction<boolean>>;
  state: boolean;
};

const YesNoDropdown: FC<YesNoDropdownProps> = ({ setState, state }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormPFSelect popperProps={{ width: '141px' }} selected={getBooleanText(state)}>
      <SelectOption key="yes-opt" onClick={() => setState(true)} value={t('Yes')}>
        {t('Yes')}
      </SelectOption>
      <SelectOption key="no-opt" onClick={() => setState(false)} value={t('No')}>
        {t('No')}
      </SelectOption>
    </FormPFSelect>
  );
};

export default YesNoDropdown;
