import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getBootDisk } from '@kubevirt-utils/resources/vm';
import {
  Alert,
  AlertVariant,
  Checkbox,
  FormGroup,
  PopoverPosition,
  Split,
  Stack,
} from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { IS_BOOT_SOURCE_FIELD } from '../utils/constants';

import './BootSourceCheckbox.scss';

type BootSourceCheckboxProps = {
  editDiskName?: string;
  isDisabled?: boolean;
  vm: V1VirtualMachine;
};

const BootSourceCheckbox: FC<BootSourceCheckboxProps> = ({ editDiskName, isDisabled, vm }) => {
  const initialBootDiskName = getBootDisk(vm)?.name;

  const isInitialBootDisk = initialBootDiskName === editDiskName;

  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<V1DiskFormState>();
  const isBootSource = watch(IS_BOOT_SOURCE_FIELD);
  const showOverrideAlert = !isDisabled && isBootSource && !isInitialBootDisk;

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
            name={IS_BOOT_SOURCE_FIELD}
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
