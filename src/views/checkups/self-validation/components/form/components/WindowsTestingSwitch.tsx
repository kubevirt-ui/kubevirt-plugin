import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, StackItem, Switch, Tooltip } from '@patternfly/react-core';

type WindowsTestingSwitchProps = {
  isTier2Selected: boolean;
  setWindowsServerTesting: (checked: boolean) => void;
  windowsServerTesting: boolean;
};

const WindowsTestingSwitch: FC<WindowsTestingSwitchProps> = ({
  isTier2Selected,
  setWindowsServerTesting,
  windowsServerTesting,
}) => {
  const { t } = useKubevirtTranslation();

  const windowsSwitch = (
    <Switch
      label={
        <>
          <span className="pf-v6-c-form__label-text">{t('Windows Server 2022 testing')}</span>
          <HelpTextIcon
            bodyContent={t(
              'Enable Windows Server 2022 golden image creation and testing. Requires accepting the Windows End User License Agreement (EULA).',
            )}
            helpIconClassName="pf-v6-u-ml-sm"
            position={PopoverPosition.right}
          />
        </>
      }
      className="pf-v6-u-mb-sm"
      id="windows-server-testing"
      isChecked={windowsServerTesting}
      isDisabled={!isTier2Selected}
      isReversed={true}
      onChange={(_event, checked) => setWindowsServerTesting(checked)}
    />
  );

  return (
    <StackItem>
      {isTier2Selected ? (
        windowsSwitch
      ) : (
        <Tooltip
          content={t('Windows Server 2022 testing requires the Tier2 test suite to be enabled.')}
          position={PopoverPosition.right}
        >
          {windowsSwitch}
        </Tooltip>
      )}
    </StackItem>
  );
};

export default WindowsTestingSwitch;
