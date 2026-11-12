import { type FC, useCallback, useEffect, useState } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useBootableVolumeSourcePermissions from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumeSourcePermissions';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { FormGroup, Select, SelectOption } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import {
  imageSourceSetValueOptions,
  resetImageSourceFieldsOnSourceChange,
} from '../utils/resetImageSourceFields';
import { getSourceOptionLabel, getSourceOptions } from '../utils/sourceOptions';

const SourceSelect: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useBootableVolumeWizardForm();
  const [isOpen, setIsOpen] = useState(false);

  const {
    field: { value: sourceType },
  } = useController({ control, name: 'imageSource.sourceType' });

  const destinationProject = useWatch({
    control,
    name: 'projectAndVolume.destinationProject',
  });

  const { defaultSource, isOptionDisabled, loading } =
    useBootableVolumeSourcePermissions(destinationProject);

  const changeSourceType = useCallback(
    (nextSource: DROPDOWN_FORM_SELECTION): void => {
      if (nextSource === sourceType) {
        return;
      }

      resetImageSourceFieldsOnSourceChange({ previousSourceType: sourceType, setValue });
      setValue('imageSource.sourceType', nextSource, imageSourceSetValueOptions);
    },
    [setValue, sourceType],
  );

  useEffect(() => {
    if (loading) return;

    if (isOptionDisabled(sourceType)) {
      changeSourceType(defaultSource);
    }
  }, [changeSourceType, defaultSource, isOptionDisabled, loading, sourceType]);

  const onSelect = useCallback(
    (_event: unknown, value: string): void => {
      changeSourceType(value as DROPDOWN_FORM_SELECTION);
      setIsOpen(false);
    },
    [changeSourceType],
  );

  return (
    <FormGroup fieldId="source-type" label={t('Source')}>
      <Select
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        selected={sourceType}
        toggle={SelectToggle({
          'data-test': 'source-type-select',
          isExpanded: isOpen,
          isFullWidth: true,
          onClick: () => setIsOpen((prev) => !prev),
          selected: getSourceOptionLabel(t, sourceType),
        })}
      >
        {getSourceOptions(t).map(({ description, label, value }) => {
          const disabled = isOptionDisabled(value);

          return (
            <SelectOption
              description={
                disabled && value === DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME
                  ? getNoPermissionTooltipContent(t)
                  : description
              }
              isDisabled={disabled}
              key={value}
              value={value}
            >
              {label}
            </SelectOption>
          );
        })}
      </Select>
    </FormGroup>
  );
};

export default SourceSelect;
