import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DiskType,
  diskTypes,
  diskTypesLabels,
} from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import { getDefaultDiskType } from '../../utils/helpers';
import { InterfaceTypes, V1DiskFormState } from '../../utils/types';
import { DISKTYPE_SELECT_FIELDID } from '../utils/constants';

type DiskTypeSelectProps = {
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const diskState = watch();

  if (!diskState) return null;

  const diskType = getDiskDrive(diskState.disk);

  const defaultInterface = getDefaultDiskType(isVMRunning);
  const diskInterface = diskState.disk?.[diskType]?.bus || defaultInterface;

  return (
    <div data-test-id={DISKTYPE_SELECT_FIELDID}>
      <FormGroup fieldId={DISKTYPE_SELECT_FIELDID} label={t('Type')}>
        <FormPFSelect
          onSelect={(_, val) => {
            setValue('disk.cdrom', null);
            setValue('disk.lun', null);
            setValue('disk.disk', null);

            // cdrom does not support virtio
            const newDiskInterface =
              val === diskTypes.cdrom && diskInterface === InterfaceTypes.VIRTIO
                ? InterfaceTypes.SCSI
                : diskInterface;

            setValue(`disk.${val as DiskType}`, { bus: newDiskInterface });
          }}
          selected={diskType}
          selectedLabel={diskTypesLabels[diskType]}
          toggleProps={{ isFullWidth: true }}
        >
          <SelectList>
            {Object.values(diskTypes).map((type) => (
              <SelectOption
                data-test-id={`${DISKTYPE_SELECT_FIELDID}-${type}`}
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
  );
};

export default DiskTypeSelect;
