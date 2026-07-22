import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, StackItem } from '@patternfly/react-core';

import { WINDOWS_EULA_URL } from '../../../utils/constants';

type WindowsEulaCheckboxProps = {
  isEulaConfirmed: boolean;
  setIsEulaConfirmed: (checked: boolean) => void;
};

const WindowsEulaCheckbox: FC<WindowsEulaCheckboxProps> = ({
  isEulaConfirmed,
  setIsEulaConfirmed,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <StackItem className="pf-v6-u-pl-lg windows-eula-checkbox">
      <Checkbox
        label={
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            By setting this parameter, you are agreeing to the applicable{' '}
            <ExternalLink href={WINDOWS_EULA_URL}>
              Microsoft end user license agreement(s)
            </ExternalLink>{' '}
            for each deployment or installation for the Microsoft product(s).
          </Trans>
        }
        id="windows-eula-checkbox"
        isChecked={isEulaConfirmed}
        onChange={(_event, checked) => setIsEulaConfirmed(checked)}
      />
    </StackItem>
  );
};

export default WindowsEulaCheckbox;
