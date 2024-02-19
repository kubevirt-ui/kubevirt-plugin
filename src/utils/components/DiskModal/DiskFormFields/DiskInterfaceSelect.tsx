import React, { Dispatch, FC, MouseEvent, useEffect, useMemo } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import { interfaceTypes } from './utils/constants';
import { getInterfaceOptions, interfaceOptionTitles } from './utils/helpers';

type DiskInterfaceSelectProps = {
  diskState: DiskFormState;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  isVMRunning: boolean;
};

const DiskInterfaceSelect: FC<DiskInterfaceSelectProps> = ({
  diskState,
  dispatchDiskState,
  isVMRunning,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskInterface, diskType } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;

  const interfaceOptions = useMemo(() => getInterfaceOptions(), []);

  const onSelect = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    dispatchDiskState({ payload: value, type: diskReducerActions.SET_DISK_INTERFACE });
  };

  useEffect(() => {
    // only SCSI is supported for hotplug
    if (isVMRunning && diskInterface !== interfaceTypes.SCSI) {
      dispatchDiskState({
        payload: interfaceTypes.SCSI,
        type: diskReducerActions.SET_DISK_INTERFACE,
      });
    }
  }, [dispatchDiskState, isVMRunning, diskInterface]);

  useEffect(() => {
    // virtio is not supported for CDROM
    if (isCDROMType && diskInterface === interfaceTypes.VIRTIO) {
      dispatchDiskState({
        payload: interfaceTypes.SATA,
        type: diskReducerActions.SET_DISK_INTERFACE,
      });
    }
  }, [diskInterface, dispatchDiskState, isCDROMType]);

  return (
    <FormGroup fieldId="disk-interface" isRequired label={t('Interface')}>
      <div data-test-id="disk-interface-select">
        <FormPFSelect
          onSelect={onSelect}
          selected={diskInterface}
          selectedLabel={interfaceOptionTitles[diskInterface]}
          toggleProps={{ isDisabled: isVMRunning, isFullWidth: true }}
        >
          {interfaceOptions.map(({ description, id, name }) => {
            const isDisabled = isCDROMType && id === interfaceTypes.VIRTIO;
            return (
              <SelectOption
                data-test-id={`disk-interface-select-${id}`}
                description={description}
                isDisabled={isDisabled}
                key={id}
                value={id}
              >
                {name}
              </SelectOption>
            );
          })}
        </FormPFSelect>
        <FormGroupHelperText>
          {t('Hot plug is enabled only for "SCSI" interface')}
        </FormGroupHelperText>
      </div>
    </FormGroup>
  );
};

export default DiskInterfaceSelect;
