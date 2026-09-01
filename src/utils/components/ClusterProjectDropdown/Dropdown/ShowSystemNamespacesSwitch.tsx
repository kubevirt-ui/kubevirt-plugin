import React, { type FC, type JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MenuSearch, Switch } from '@patternfly/react-core';

type ShowSystemNamespacesSwitchProps = {
  hasSystemNamespaces: boolean;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

const ShowSystemNamespacesSwitch: FC<ShowSystemNamespacesSwitchProps> = ({
  hasSystemNamespaces,
  isChecked,
  onChange,
}): JSX.Element | null => {
  const { t } = useKubevirtTranslation();

  if (!hasSystemNamespaces) {
    return null;
  }

  return (
    <MenuSearch>
      <Switch
        id="show-system-namespaces-switch"
        isChecked={isChecked}
        label={t('Show default projects')}
        onChange={(_event, checked) => {
          _event.stopPropagation();
          onChange(checked);
        }}
      />
    </MenuSearch>
  );
};

export default ShowSystemNamespacesSwitch;
