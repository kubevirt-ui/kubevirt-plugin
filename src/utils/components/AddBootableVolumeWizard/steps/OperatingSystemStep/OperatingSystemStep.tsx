import type { FC } from 'react';

import ArchitectureSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/ArchitectureSelect/ArchitectureSelect';
import PreferenceSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/PreferenceSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, Title } from '@patternfly/react-core';

import useOperatingSystemFormFields from '../../hooks/useOperatingSystemFormFields';
import { getOperatingSystemLabel } from '../../utils/constants';
import AdvancedInstanceTypeSettings from './components/AdvancedInstanceTypeSettings';

const OperatingSystemStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { bootableVolume, deleteLabel, setBootableVolumeField } = useOperatingSystemFormFields();
  const operatingSystemLabel = getOperatingSystemLabel(t);

  return (
    <>
      <Title className="pf-v6-u-mb-md" headingLevel="h2">
        {operatingSystemLabel}
      </Title>
      <Form>
        <PreferenceSelect
          bootableVolume={bootableVolume}
          deleteLabel={deleteLabel}
          label={operatingSystemLabel}
          placeholder={t('Select operating system')}
          setBootableVolumeField={setBootableVolumeField}
        />
        <ArchitectureSelect
          bootableVolumeState={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
        />
        <AdvancedInstanceTypeSettings
          bootableVolume={bootableVolume}
          deleteLabel={deleteLabel}
          setBootableVolumeField={setBootableVolumeField}
        />
      </Form>
    </>
  );
};

export default OperatingSystemStep;
