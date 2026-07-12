import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsVSOCKFeatureEnabled from '@kubevirt-utils/hooks/useVSOCKFeatureFlag/useIsVSOCKFeatureEnabled';
import { isVSOCKEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type EnableVSOCKProps = {
  updateVSOCK: (checked: boolean) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const EnableVSOCK: FC<EnableVSOCKProps> = ({ updateVSOCK, vm }) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(isVSOCKEnabled(vm));

  const { featureEnabled: isVSOCKFeatureGateEnabled, isLoading } = useIsVSOCKFeatureEnabled();

  const isDisabled = useMemo(
    () => !isLoading && !isVSOCKFeatureGateEnabled,
    [isLoading, isVSOCKFeatureGateEnabled],
  );

  return (
    <Switch
      onChange={(_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setIsChecked(checked);
        updateVSOCK(checked);
      }}
      aria-label={t('Enable VSOCK')}
      checked={isChecked}
      id="enable-vsock"
      isDisabled={isDisabled}
    />
  );
};

export default EnableVSOCK;
