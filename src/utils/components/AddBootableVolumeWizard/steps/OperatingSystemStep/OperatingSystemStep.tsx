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
  const {
    architectures,
    cluster,
    deleteLabel,
    labels,
    lockedPreference,
    namespace,
    setArchitectures,
    setLabel,
  } = useOperatingSystemFormFields();
  const operatingSystemLabel = getOperatingSystemLabel(t);

  return (
    <>
      <Title className="pf-v6-u-mb-md" headingLevel="h2">
        {operatingSystemLabel}
      </Title>
      <Form>
        <PreferenceSelect
          cluster={cluster}
          deleteLabel={deleteLabel}
          label={operatingSystemLabel}
          labels={labels}
          lockedPreference={lockedPreference}
          namespace={namespace}
          placeholder={t('Select operating system')}
          setLabel={setLabel}
        />
        <ArchitectureSelect
          architectures={architectures}
          cluster={cluster}
          onArchitecturesChange={setArchitectures}
        />
        <AdvancedInstanceTypeSettings
          cluster={cluster}
          deleteLabel={deleteLabel}
          labels={labels}
          namespace={namespace}
          setLabel={setLabel}
        />
      </Form>
    </>
  );
};

export default OperatingSystemStep;
