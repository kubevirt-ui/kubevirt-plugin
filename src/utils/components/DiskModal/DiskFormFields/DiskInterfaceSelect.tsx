import React, { ChangeEvent, Dispatch, FC, useEffect, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import { interfaceTypes } from './utils/constants';
import { getInterfaceOptions } from './utils/helpers';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const interfaceOptions = useMemo(() => getInterfaceOptions(), []);

  const onSelect = (event: ChangeEvent<HTMLSelectElement>, value: string) => {
    setIsOpen(false);
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
    <>
      <FormGroup
        fieldId="disk-interface"
        helperText={t('Hot plug is enabled only for "SCSI" interface')}
        isRequired
        label={t('Interface')}
      >
        <div data-test-id="disk-interface-select">
          <Select
            direction="up"
            isOpen={isOpen}
            menuAppendTo="parent"
            onSelect={onSelect}
            onToggle={setIsOpen}
            selections={diskInterface}
            variant={SelectVariant.single}
          >
            {interfaceOptions.map(({ description, id, name }) => {
              const isDisabled =
                (isVMRunning && id !== interfaceTypes.SCSI) ||
                (isCDROMType && id === interfaceTypes.VIRTIO);
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
          </Select>
        </div>
      </FormGroup>
    </>
  );
};

export default DiskInterfaceSelect;
