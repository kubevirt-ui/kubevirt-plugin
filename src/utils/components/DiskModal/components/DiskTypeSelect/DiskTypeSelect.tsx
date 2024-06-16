import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes, diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import { DiskFormState, InterfaceTypes, SourceTypes } from '../../utils/types';
import {
  diskInterfaceField,
  diskSourceField,
  diskTypeField,
  diskTypeSelectFieldID,
} from '../utils/constants';

type DiskTypeSelectProps = {
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const [diskInterface, diskSource] = watch([diskInterfaceField, diskSourceField]);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <div data-test-id={diskTypeSelectFieldID}>
          <FormGroup fieldId={diskTypeSelectFieldID} label={t('Type')}>
            <FormPFSelect
              onSelect={(_, val) => {
                onChange(val);
                if (val === diskTypes.cdrom) {
                  if (SourceTypes.BLANK === diskSource) {
                    setValue(diskSourceField, SourceTypes.HTTP);
                  }

                  if (diskInterface === InterfaceTypes.VIRTIO) {
                    setValue(diskInterfaceField, InterfaceTypes.SATA);
                  }
                }
              }}
              selected={value}
              selectedLabel={diskTypesLabels[value]}
              toggleProps={{ isFullWidth: true }}
            >
              <SelectList>
                {Object.values(diskTypes).map((type) => (
                  <SelectOption
                    data-test-id={`${diskTypeSelectFieldID}-${type}`}
                    isDisabled={isVMRunning && type === diskTypes.cdrom}
                    key={type}
                    value={type}
                  >
                    {diskTypesLabels[type]}
                  </SelectOption>
                ))}
              </SelectList>
            </FormPFSelect>
            <FormGroupHelperText>
              {t('Hot plug is enabled only for "Disk" and "Lun" types')}
            </FormGroupHelperText>
          </FormGroup>
        </div>
      )}
      control={control}
      name={diskTypeField}
    />
  );
};

export default DiskTypeSelect;
