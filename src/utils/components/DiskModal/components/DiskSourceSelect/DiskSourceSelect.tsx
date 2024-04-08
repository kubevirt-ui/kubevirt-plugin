import React, { FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import { DEFAULT_DISK_SIZE } from '../../utils/constants';
import { DiskFormState, SourceTypes } from '../../utils/types';
import { diskSizeField, diskSourceField, DYNAMIC, OTHER } from '../utils/constants';

import { diskSourceFieldID } from './utils/constants';
import { getDiskSourceOptions, getSelectedDiskSourceComponent } from './utils/utils';

type DiskSourceSelectProps = {
  isTemplate: boolean;
  relevantUpload?: DataUpload;
  vm: V1VirtualMachine;
};

const DiskSourceSelect: FC<DiskSourceSelectProps> = ({ isTemplate, relevantUpload, vm }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const { diskSize, diskSource, diskType } = watch();
  const isCDROMType = diskType === diskTypes.cdrom;

  const sourceOptions = useMemo(() => getDiskSourceOptions(isTemplate), [isTemplate]);

  return (
    <>
      <Controller
        render={({ field: { onChange, value } }) => (
          <FormGroup fieldId={diskSourceFieldID} isRequired label={t('Source')}>
            <div data-test-id={`${diskSourceFieldID}-select`}>
              <FormPFSelect
                onSelect={(_, val: string) => {
                  if (diskSize === DYNAMIC && val !== SourceTypes.EPHEMERAL) {
                    setValue(diskSizeField, DEFAULT_DISK_SIZE);
                  }

                  onChange(val);
                }}
                selected={value}
                selectedLabel={sourceOptions[value]?.label}
                toggleProps={{ isDisabled: value === OTHER, isFullWidth: true }}
              >
                <SelectList>
                  {Object.entries(sourceOptions).map(([id, { description, label }]) => {
                    const isDisabled =
                      (isRunning(vm) && id === SourceTypes.EPHEMERAL) ||
                      (isCDROMType && id === SourceTypes.BLANK) ||
                      (isTemplate && id === SourceTypes.UPLOAD);
                    return (
                      <SelectOption
                        data-test-id={`${diskSourceFieldID}-select-${id}`}
                        description={description}
                        isDisabled={isDisabled}
                        key={id}
                        value={id}
                      >
                        {label}
                      </SelectOption>
                    );
                  })}
                </SelectList>
              </FormPFSelect>
            </div>
          </FormGroup>
        )}
        control={control}
        name={diskSourceField}
        rules={{ required: true }}
      />
      {getSelectedDiskSourceComponent(vm, relevantUpload)[diskSource]}
    </>
  );
};

export default DiskSourceSelect;
