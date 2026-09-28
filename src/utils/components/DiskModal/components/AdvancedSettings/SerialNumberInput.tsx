import { type FC, useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { getDiskInterface } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { isRunning } from '@virtualmachines/utils';

import type { V1DiskFormState } from '../../utils/types';
import { DISK_SERIAL_FIELD } from '../utils/constants';
import {
  generateRandomSerial,
  getSerialMaxLength,
  SERIAL_HELPER_ID,
  validateSerial,
} from './serialNumberUtils';

type SerialNumberInputProps = {
  editDiskName?: string;
  vm?: V1VirtualMachine;
};

const SerialNumberInput: FC<SerialNumberInputProps> = ({ editDiskName, vm }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<V1DiskFormState>();
  const currentDiskName = watch('disk.name');
  const formDisk = watch('disk');
  const maxLength = getSerialMaxLength(getDiskInterface(formDisk));
  const isVMRunning = isRunning(vm);

  const isSerialChanged = useCallback(
    (value: string | undefined): boolean => {
      if (!editDiskName) return false;
      const original = (getDisks(vm) ?? []).find((disk) => disk.name === editDiskName)?.serial;
      return value !== original;
    },
    [vm, editDiskName],
  );

  const existingSerials = useMemo((): string[] => {
    const disks = getDisks(vm) ?? [];
    return disks
      .filter((disk) => disk.name !== editDiskName && disk.name !== currentDiskName)
      .map((disk) => disk.serial?.toLowerCase())
      .filter(Boolean);
  }, [vm, editDiskName, currentDiskName]);

  const validate = useCallback(
    (value: string | undefined) => validateSerial(value, existingSerials, maxLength, t),
    [t, existingSerials, maxLength],
  );

  return (
    <Controller
      control={control}
      name={DISK_SERIAL_FIELD}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const serialChanged = isSerialChanged(value);
        const hasHelper = Boolean(error) || (isVMRunning && serialChanged);
        return (
          <FormGroup
            fieldId="disk-serial-number"
            label={t('Serial number (optional)')}
            labelHelp={
              <HelpTextIcon
                bodyContent={t(
                  'A unique identifier for the disk device visible to the guest operating system. Useful for disk identification and troubleshooting.',
                )}
                headerContent={t('Serial number')}
              />
            }
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  aria-describedby={hasHelper ? SERIAL_HELPER_ID : undefined}
                  aria-label={t('Serial number')}
                  data-test="disk-serial-input"
                  id="disk-serial-number"
                  maxLength={maxLength}
                  onChange={(_event, val) => onChange(val)}
                  placeholder={t('e.g. RHEL9-DATA-01')}
                  validated={error ? 'error' : 'default'}
                  value={value ?? ''}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Tooltip content={t('Generate unique serial number')}>
                  <Button
                    aria-label={t('Generate unique serial number')}
                    data-test="generate-serial-btn"
                    onClick={() => {
                      let serial = generateRandomSerial();
                      while (existingSerials.includes(serial)) {
                        serial = generateRandomSerial();
                      }
                      onChange(serial);
                    }}
                    variant="control"
                  >
                    <SyncAltIcon />
                  </Button>
                </Tooltip>
              </InputGroupItem>
            </InputGroup>
            {error && (
              <FormHelperText id={SERIAL_HELPER_ID}>
                <HelperText>
                  <HelperTextItem variant="error">{error.message}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
            {isVMRunning && !error && serialChanged && (
              <FormHelperText id={SERIAL_HELPER_ID}>
                <HelperText isLiveRegion>
                  <HelperTextItem variant="warning">
                    {t(
                      'Applies to the VM spec only. The guest may keep the old serial until restart.',
                    )}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        );
      }}
      rules={{ validate }}
    />
  );
};

export default SerialNumberInput;
