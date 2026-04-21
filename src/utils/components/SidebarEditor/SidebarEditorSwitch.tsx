import React, { FC, memo, useContext } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Switch } from '@patternfly/react-core';

import { SidebarEditorContext } from './SidebarEditorContext';

const SidebarEditorSwitch: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { setEditorVisible, showEditor, showSwitch } = useContext(SidebarEditorContext);

  if (!showSwitch) return null;

  return (
    <Switch
      className="regular-font-weight"
      id="sidebar-editor-switch"
      isChecked={showEditor}
      label={t('YAML')}
      onChange={(_, checked: boolean) => setEditorVisible(checked)}
    />
  );
});

export default SidebarEditorSwitch;
