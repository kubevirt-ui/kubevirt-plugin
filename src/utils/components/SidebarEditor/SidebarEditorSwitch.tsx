import React, { FC, memo, useContext } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Switch } from '@patternfly/react-core';

import { SidebarEditorContext } from './SidebarEditorContext';

const SidebarEditorSwitch: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { showEditor, setEditorVisible } = useContext(SidebarEditorContext);

  return (
    <Switch
      id="sidebar-editor-switch"
      label={t('YAML: ON')}
      labelOff={t('YAML: OFF')}
      isChecked={showEditor}
      onChange={setEditorVisible}
    />
  );
});

export default SidebarEditorSwitch;
