import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import { DEFAULT_DISK_SIZE } from '../../utils/constants';
import { DiskFormState, SourceTypes } from '../../utils/types';
import { diskSizeField, diskSourceField, DYNAMIC, OTHER } from '../utils/constants';

import DiskSourceSelectOptionGroups from './components/DiskSourceSelectOptions/DiskSourceSelectOptionGroups';
import { diskSourceFieldID, optionLabelMapper } from './utils/constants';
import { getSelectedDiskSourceComponent } from './utils/utils';

type DiskSourceSelectProps = {
  isTemplate: boolean;
  relevantUpload?: DataUpload;
  vm: V1VirtualMachine;
};

const DiskSourceSelect: FC<DiskSourceSelectProps> = ({ isTemplate, relevantUpload, vm }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const { diskSize, diskSource } = watch();

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
                selectedLabel={optionLabelMapper[value]}
                toggleProps={{ isDisabled: value === OTHER, isFullWidth: true }}
              >
                <DiskSourceSelectOptionGroups isTemplate={isTemplate} isVMRunning={isRunning(vm)} />
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
