import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem, Switch } from '@patternfly/react-core';

import { Customizations } from '../../utils/constants';
import { updateDeschedulerValue } from '../../utils/deschedulerAPI';

type EnableSoftTainterProps = {
  isEnabled: boolean;
};

const EnableSoftTainter: FC<EnableSoftTainterProps> = ({ isEnabled }) => {
  const onSwitchChange = (_, checked: boolean) => {
    updateDeschedulerValue('/spec/profileCustomizations/devEnableSoftTainter', checked);
  };

  return (
    <Split>
      <SplitItem isFilled>
        {Customizations.EnableSoftTainter}{' '}
        <HelpTextIcon
          bodyContent={t(
            'Have the operator deploying the soft-tainter component to dynamically set/remove soft taints as a hint for the scheduler based on the same criteria used for the descheduling.',
          )}
        />
      </SplitItem>
      <SplitItem>
        <Switch isChecked={isEnabled} onChange={onSwitchChange} />
      </SplitItem>
    </Split>
  );
};

export default EnableSoftTainter;
