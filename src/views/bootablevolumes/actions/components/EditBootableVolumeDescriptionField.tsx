// Extracted from EditBootableVolumesModal.tsx
// Root: src/views/bootablevolumes/actions/components/EditBootableVolumesModal.tsx

import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextArea } from '@patternfly/react-core';

type EditBootableVolumeDescriptionFieldProps = {
  description: string;
  setDescription: (description: string) => void;
};

const EditBootableVolumeDescriptionField: FC<EditBootableVolumeDescriptionFieldProps> = ({
  description,
  setDescription,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Description')}>
      <TextArea
        aria-label={t('description text area')}
        onChange={(_event, value): void => setDescription(value)}
        resizeOrientation="vertical"
        value={description}
      />
    </FormGroup>
  );
};

export default EditBootableVolumeDescriptionField;
