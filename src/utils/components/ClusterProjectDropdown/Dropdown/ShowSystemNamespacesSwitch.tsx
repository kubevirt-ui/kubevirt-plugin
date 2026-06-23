import React, { FC, JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, Switch } from '@patternfly/react-core';

type ShowSystemNamespacesSwitchProps = {
  cssPrefix: string;
  hasSystemNamespaces: boolean;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

const ShowSystemNamespacesSwitch: FC<ShowSystemNamespacesSwitchProps> = ({
  cssPrefix,
  hasSystemNamespaces,
  isChecked,
  onChange,
}): JSX.Element | null => {
  const { t } = useKubevirtTranslation();

  if (!hasSystemNamespaces) {
    return null;
  }

  return (
    <>
      <Divider />
      <div className={`${cssPrefix}__system-switch`}>
        <Switch
          onChange={(_event, checked) => {
            _event.preventDefault();
            _event.stopPropagation();
            onChange(checked);
          }}
          data-test="showSystemSwitch"
          id={`${cssPrefix}-show-system-switch`}
          isChecked={isChecked}
          label={t('Show default projects')}
        />
      </div>
    </>
  );
};

export default ShowSystemNamespacesSwitch;
