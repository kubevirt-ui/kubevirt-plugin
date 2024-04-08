import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Checkbox,
  FormGroup,
  PopoverPosition,
  Split,
  Stack,
} from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import { isBootSourceField } from '../utils/constants';

import './BootSourceCheckbox.scss';

type BootSourceCheckboxProps = {
  initialBootDiskName?: string;
  isDisabled?: boolean;
};

const BootSourceCheckbox: FC<BootSourceCheckboxProps> = ({ initialBootDiskName, isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<DiskFormState>();
  const isBootSource = watch(isBootSourceField);
  const showOverrideAlert = !isDisabled && isBootSource && initialBootDiskName;

  return (
    <FormGroup fieldId="enable-bootsource">
      <Stack hasGutter>
        <Split className="enable-bootsource-checkbox" hasGutter>
          <Controller
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id="enable-bootsource"
                isChecked={value}
                isDisabled={isDisabled}
                label={t('Use this disk as a boot source')}
                onChange={onChange}
              />
            )}
            control={control}
            name={isBootSourceField}
          />
          <HelpTextIcon
            bodyContent={t(
              'Only one disk can be bootable at a time, this option is disabled if the VirtualMachine is running or if this disk is the current boot source',
            )}
            position={PopoverPosition.right}
          />
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
