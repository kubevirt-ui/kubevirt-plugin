import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Checkbox, Split, SplitItem } from '@patternfly/react-core';
import UseAlternativeOptionHelpIcon from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/UseAlternativeOptionHelpIcon/UseAlternativeOptionHelpIcon';

import './UseAlternativeCheckbox.scss';

type UseAlternativeOptionCheckboxProps = {
  className?: string;
  id: string;
  isChecked: boolean;
  isDisabled?: boolean;
  olsPromptType: OLSPromptType;
  onChange: (isChecked: boolean) => void;
};

const UseAlternativeOptionCheckbox: FCC<UseAlternativeOptionCheckboxProps> = ({
  className,
  id,
  isChecked,
  isDisabled,
  olsPromptType,
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
          isDisabled={isDisabled}
          onChange={(_, checked) => onChange(checked)}
        />
      </SplitItem>
      <SplitItem>
        <UseAlternativeOptionHelpIcon olsPromptType={olsPromptType} />
      </SplitItem>
    </Split>
  );
};

export default UseAlternativeOptionCheckbox;
