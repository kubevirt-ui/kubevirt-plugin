import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, Title } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../form/BootableVolumeWizardFormProvider';
import AdvancedStorageSettings from './components/AdvancedStorageSettings';
import DiskSizeInput from './components/DiskSizeInput';
import ExistingSnapshotSourceFields from './components/ExistingSnapshotSourceFields';
import ExistingVolumeSourceFields from './components/ExistingVolumeSourceFields';
import RegistrySourceFields from './components/RegistrySourceFields';
import SourceSelect from './components/SourceSelect';
import UploadSourceFields from './components/UploadSourceFields';
import URLSourceFields from './components/URLSourceFields';

const SOURCE_FIELDS_BY_TYPE: Partial<Record<DROPDOWN_FORM_SELECTION, FC>> = {
  [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: UploadSourceFields,
  [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: ExistingVolumeSourceFields,
  [DROPDOWN_FORM_SELECTION.USE_HTTP]: URLSourceFields,
  [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: RegistrySourceFields,
  [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: ExistingSnapshotSourceFields,
};

const ImageSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const sourceType = useWatch({ control, name: 'imageSource.sourceType' });

  const SourceFields = SOURCE_FIELDS_BY_TYPE[sourceType];
  const isSnapshotSource = sourceType === DROPDOWN_FORM_SELECTION.USE_SNAPSHOT;

  return (
    <>
      <Title className="pf-v6-u-mb-md" headingLevel="h2">
        {t('Image source')}
      </Title>
      <Form>
        <SourceSelect />
        {SourceFields && <SourceFields />}
        {Boolean(sourceType) && (
          <>
            <DiskSizeInput
              helperText={
                isSnapshotSource
                  ? t('Disk size will be determined by the volume snapshot size')
                  : undefined
              }
              isDisabled={isSnapshotSource}
            />
            <AdvancedStorageSettings />
          </>
        )}
      </Form>
    </>
  );
};

export default ImageSourceStep;
