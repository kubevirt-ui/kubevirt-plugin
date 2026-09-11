// Extracted from EditBootableVolumesModal.tsx
// Root: src/views/bootablevolumes/actions/components/EditBootableVolumesModal.tsx

import { type FC, type ReactNode } from 'react';

import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import PreferencePopoverContent from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/PreferencePopoverContent';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

type EditBootableVolumePreferenceFieldProps = {
  preference: string;
  preferencesNames: string[];
  setPreference: (preference: string) => void;
};

const EditBootableVolumePreferenceField: FC<EditBootableVolumePreferenceFieldProps> = ({
  preference,
  preferencesNames,
  setPreference,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      isRequired
      label={t('Preference')}
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide: () => void): ReactNode => (
            <PopoverContentWithLightspeedButton
              content={<PreferencePopoverContent />}
              hide={hide}
              promptType={OLSPromptType.PREFERENCE}
            />
          )}
          position={PopoverPosition.right}
        />
      }
    >
      <InlineFilterSelect
        options={preferencesNames?.map((option) => ({
          children: option,
          groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
          value: option,
        }))}
        placeholder={t('Select preference')}
        selected={preference}
        setSelected={setPreference}
      />
    </FormGroup>
  );
};

export default EditBootableVolumePreferenceField;
