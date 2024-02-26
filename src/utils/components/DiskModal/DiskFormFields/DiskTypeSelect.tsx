import React, { Dispatch, FC, MouseEvent, useCallback } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes, diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type DiskTypeSelectProps = {
  diskType: string;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ diskType, dispatchDiskState, isVMRunning }) => {
  const { t } = useKubevirtTranslation();

  const typeOptions = Object.values(diskTypes).filter((type) => type !== diskTypes.floppy);

  const onSelectDiskSource = useCallback(
    (_event: MouseEvent, selection: string) => {
      dispatchDiskState({ payload: selection, type: diskReducerActions.SET_DISK_TYPE });
    },
    [dispatchDiskState],
  );

  return (
    <div data-test-id="disk-type-select">
      <FormGroup fieldId="disk-source-type-select" label={t('Type')}>
        <FormPFSelect
          onSelect={onSelectDiskSource}
          selected={diskType}
          selectedLabel={diskTypesLabels[diskType]}
          toggleProps={{ isDisabled: isVMRunning, isFullWidth: true }}
        >
          <SelectList>
            {typeOptions.map((type) => (
              <SelectOption data-test-id={`disk-type-select-${type}`} key={type} value={type}>
                {diskTypesLabels[type]}
              </SelectOption>
            ))}
          </SelectList>
        </FormPFSelect>
        <FormGroupHelperText>{t('Hot plug is enabled only for "Disk" type')}</FormGroupHelperText>
      </FormGroup>
    </div>
  );
};

export default DiskTypeSelect;
