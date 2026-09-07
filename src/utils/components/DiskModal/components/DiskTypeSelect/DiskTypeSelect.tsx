import React, { type FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  type DiskType,
  diskTypes,
  diskTypesLabels,
} from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import { getSourceFromVolume } from '../../utils/helpers';
import { InterfaceTypes, SourceTypes, type V1DiskFormState } from '../../utils/types';
import { getDiskTypeHelperText } from '../DiskInterfaceSelect/utils/util';
import { DISKTYPE_SELECT_FIELDID } from '../utils/constants';

type DiskTypeSelectProps = {
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const diskState = watch();

  const diskType = getDiskDrive(diskState?.disk);
  const [initialDiskType] = useState<DiskType>(diskType);

  if (!diskState) return null;

  const diskSource = getSourceFromVolume(diskState.volume, diskState.dataVolumeTemplate);

  const shouldDisableOption = (optionType: DiskType): boolean => {
    return optionType === diskTypes.cdrom && isVMRunning && diskSource !== SourceTypes.CDROM;
  };

  const diskInterface = diskState.disk?.[diskType]?.bus ?? InterfaceTypes.VIRTIO;

  const userHelpText = getDiskTypeHelperText(initialDiskType, isVMRunning);

  return (
    <div data-test={DISKTYPE_SELECT_FIELDID}>
      <FormGroup fieldId={DISKTYPE_SELECT_FIELDID} label={t('Type')}>
        <FormPFSelect
          isDisabled={initialDiskType === diskTypes.cdrom}
          onSelect={(_event, val) => {
            setValue('disk.cdrom', null);
            setValue('disk.lun', null);
            setValue('disk.disk', null);

            //cd-rom doesn't support virtio and LUN only supports SCSI
            const newDiskInterface =
              (val === diskTypes.cdrom && diskInterface === InterfaceTypes.VIRTIO) ||
              (val === diskTypes.lun && diskInterface !== InterfaceTypes.SCSI)
                ? InterfaceTypes.SCSI
                : diskInterface;

            setValue(`disk.${val as DiskType}`, { bus: newDiskInterface });
          }}
          selected={diskType}
          selectedLabel={diskTypesLabels[diskType]}
          toggleProps={{ isFullWidth: true }}
        >
          {Object.values(diskTypes).map((type) => (
            <SelectOption
              data-test={`${DISKTYPE_SELECT_FIELDID}-${type}`}
              isDisabled={shouldDisableOption(type)}
              key={type}
              value={type}
            >
              {diskTypesLabels[type]}
            </SelectOption>
          ))}
        </FormPFSelect>
        {userHelpText && <FormGroupHelperText>{userHelpText}</FormGroupHelperText>}
      </FormGroup>
    </div>
  );
};

export default DiskTypeSelect;
