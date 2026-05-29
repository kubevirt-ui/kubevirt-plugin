import React, { FC, memo, useContext } from 'react';
import { useLocation } from 'react-router';

import { TELEMETRY_EDITOR_VIEW_SWITCH } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logEditorViewSwitched } from '@kubevirt-utils/extensions/telemetry/yaml-vs-ui';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Switch } from '@patternfly/react-core';

import { SidebarEditorContext } from './SidebarEditorContext';

const SidebarEditorSwitch: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { pathname } = useLocation();
  const { setEditorVisible, showEditor, showSwitch, telemetryResourceType, telemetryStepOrField } =
    useContext(SidebarEditorContext);

  if (!showSwitch) return null;

  const handleSwitchChange = (_: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (telemetryResourceType) {
      logEditorViewSwitched(
        telemetryResourceType,
        checked
          ? TELEMETRY_EDITOR_VIEW_SWITCH.FORM_TO_YAML
          : TELEMETRY_EDITOR_VIEW_SWITCH.YAML_TO_FORM,
        telemetryStepOrField ?? pathname.split('/').filter(Boolean).pop(),
      );
    }
    setEditorVisible(checked);
  };

  return (
    <Switch
      className="regular-font-weight"
      id="sidebar-editor-switch"
      isChecked={showEditor}
      label={t('YAML')}
      onChange={handleSwitchChange}
    />
  );
});

export default SidebarEditorSwitch;
