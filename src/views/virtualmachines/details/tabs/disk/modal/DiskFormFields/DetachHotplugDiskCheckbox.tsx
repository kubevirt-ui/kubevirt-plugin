import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type DetachHotplugDiskCheckboxProps = {
  detachHotplug: boolean;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isVMRunning: boolean;
};

const DetachHotplugDiskCheckbox: React.FC<DetachHotplugDiskCheckboxProps> = ({
  isVMRunning,
  detachHotplug,
  dispatchDiskState,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      fieldId="detach-hotplug-disk"
      helperText={t(
        'Leave this option unchecked to make your hotplugged disk a permanent part of your virtual machine configuration.',
      )}
      isInline
    >
      <Checkbox
        id="detach-hotplug-disk"
        isDisabled={!isVMRunning}
        label={t('Detach this hotplugged disk upon VM restart')}
        isChecked={detachHotplug}
        onChange={(checked) =>
          dispatchDiskState({
            type: diskReducerActions.SET_DETACH_HOTPLUG,
            payload: checked,
          })
        }
      />
    </FormGroup>
  );
};

export default DetachHotplugDiskCheckbox;
