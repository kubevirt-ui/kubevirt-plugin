import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type HeadlessModeProps = {
  updateHeadlessMode: (checked: boolean) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const HeadlessMode: FC<HeadlessModeProps> = ({ updateHeadlessMode, vm }) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(isHeadlessMode(vm));
  return (
    <Switch
      aria-label={t('Headless mode')}
      id="headless-mode"
      isChecked={isChecked}
      onChange={(_event, checked: boolean) => {
        setIsChecked(checked);
        updateHeadlessMode(checked);
      }}
    />
  );
};

export default HeadlessMode;
