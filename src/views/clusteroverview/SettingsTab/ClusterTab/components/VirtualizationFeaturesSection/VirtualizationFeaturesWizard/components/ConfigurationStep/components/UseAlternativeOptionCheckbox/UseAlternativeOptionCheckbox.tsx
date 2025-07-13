import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import UseAlternativeOptionHelpIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/UseAlternativeOptionHelpIcon/UseAlternativeOptionHelpIcon';
import { Checkbox, Split, SplitItem } from '@patternfly/react-core';

import './UseAlternativeCheckbox.scss';

type UseAlternativeOptionCheckboxProps = {
  className?: string;
  id: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

const UseAlternativeOptionCheckbox: FC<UseAlternativeOptionCheckboxProps> = ({
  className,
  id,
  isChecked,
  onChange,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Split className={className}>
      <SplitItem>
        <Checkbox
          label={
            <div className="use-alternative-checkbox__text">
              {t('I am using an alternative solution for this feature')}
            </div>
          }
          id={id}
          isChecked={isChecked}
          onChange={(_, checked) => onChange(checked)}
        />
      </SplitItem>
      <SplitItem>
        <UseAlternativeOptionHelpIcon />
      </SplitItem>
    </Split>
  );
};

export default UseAlternativeOptionCheckbox;
