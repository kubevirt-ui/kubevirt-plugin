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
  isBootSource: boolean;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isDisabled?: boolean;
  initialBootDiskName?: string;
};

const BootSourceCheckbox: React.FC<BootSourceCheckboxProps> = ({
  isBootSource,
  dispatchDiskState,
  isDisabled,
  initialBootDiskName,
}) => {
  const { t } = useKubevirtTranslation();
  const showOverrideAlert = !isDisabled && isBootSource && initialBootDiskName;

  return (
    <FormGroup fieldId="enable-bootsource">
      <Stack hasGutter>
        <Split hasGutter className="enable-bootsource-checkbox">
          <Checkbox
            id="enable-bootsource"
            label={t('Use this disk as a boot source')}
            isChecked={isBootSource}
            onChange={(checked) =>
              dispatchDiskState({ type: diskReducerActions.SET_BOOT_SOURCE, payload: checked })
            }
            isDisabled={isDisabled}
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
          <Alert isInline variant={AlertVariant.warning} title={t('Warning')}>
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
