import React, { FC, memo, useContext } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Switch } from '@patternfly/react-core';

import { SidebarEditorContext } from './SidebarEditorContext';

const SidebarEditorSwitch: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { showEditor, setEditorVisible, showSwitch } = useContext(SidebarEditorContext);

  if (!showSwitch) return null;

  return (
    <Switch
      id="sidebar-editor-switch"
      label={t('YAML')}
      isChecked={showEditor}
      onChange={setEditorVisible}
      className="regular-font-weight"
    />
  );
});

export default SidebarEditorSwitch;
