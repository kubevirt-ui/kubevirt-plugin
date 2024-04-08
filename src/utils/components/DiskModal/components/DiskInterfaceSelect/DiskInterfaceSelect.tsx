import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import { DiskFormState, InterfaceTypes } from '../../utils/types';
import { diskInterfaceField, diskTypeField } from '../utils/constants';

import { diskInterfaceOptions } from './utils/constants';

type DiskInterfaceSelectProps = {
  isVMRunning: boolean;
};

const DiskInterfaceSelect: FC<DiskInterfaceSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<DiskFormState>();
  const diskType = watch(diskTypeField);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup fieldId="disk-interface" isRequired label={t('Interface')}>
          <div data-test-id="disk-interface-select">
            <FormPFSelect
              onSelect={(_, val) => onChange(val)}
              selected={value}
              selectedLabel={diskInterfaceOptions[value]?.label}
              toggleProps={{ isDisabled: isVMRunning, isFullWidth: true }}
            >
              {Object.entries(diskInterfaceOptions).map(([id, { description, label }]) => {
                const isDisabled = diskType === diskTypes.cdrom && id === InterfaceTypes.VIRTIO;
                return (
                  <SelectOption
                    data-test-id={`disk-interface-select-${id}`}
                    description={description}
                    isDisabled={isDisabled}
                    key={id}
                    value={id}
                  >
                    {label}
                  </SelectOption>
                );
              })}
            </FormPFSelect>
            <FormGroupHelperText>
              {t('Hot plug is enabled only for "SCSI" interface')}
            </FormGroupHelperText>
          </div>
        </FormGroup>
      )}
      control={control}
      name={diskInterfaceField}
    />
  );
};

export default DiskInterfaceSelect;
