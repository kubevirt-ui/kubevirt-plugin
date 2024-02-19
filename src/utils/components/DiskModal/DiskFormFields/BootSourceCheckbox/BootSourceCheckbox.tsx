import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Checkbox,
  FormGroup,
  Popover,
  PopoverPosition,
  Split,
  Stack,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { diskReducerActions, DiskReducerActionType } from '../../state/actions';

import './BootSourceCheckbox.scss';

type BootSourceCheckboxProps = {
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  initialBootDiskName?: string;
  isBootSource: boolean;
  isDisabled?: boolean;
};

const BootSourceCheckbox: React.FC<BootSourceCheckboxProps> = ({
  dispatchDiskState,
  initialBootDiskName,
  isBootSource,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const showOverrideAlert = !isDisabled && isBootSource && initialBootDiskName;

  return (
    <FormGroup fieldId="enable-bootsource">
      <Stack hasGutter>
        <Split className="enable-bootsource-checkbox" hasGutter>
          <Checkbox
            onChange={(_event, checked) =>
              dispatchDiskState({ payload: checked, type: diskReducerActions.SET_BOOT_SOURCE })
            }
            id="enable-bootsource"
            isChecked={isBootSource}
            isDisabled={isDisabled}
            label={t('Use this disk as a boot source')}
          />
          <Popover
            bodyContent={
              <div>
                {t(
                  'Only one disk can be bootable at a time, this option is disabled if the VirtualMachine is running or if this disk is the current boot source',
                )}
              </div>
            }
            position={PopoverPosition.right}
          >
            <HelpIcon />
          </Popover>
        </Split>

        {showOverrideAlert && (
          <Alert isInline title={t('Warning')} variant={AlertVariant.warning}>
            {t(
              'Only one disk can be bootable at a time. The bootable flag will be removed from "{{initialBootDiskName}}" and placed on this disk.',
              { initialBootDiskName },
            )}
          </Alert>
        )}
      </Stack>
    </FormGroup>
  );
};

export default BootSourceCheckbox;
