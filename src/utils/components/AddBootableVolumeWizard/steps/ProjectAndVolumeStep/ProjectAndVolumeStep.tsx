import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, Title } from '@patternfly/react-core';

import DestinationProjectSelect from './components/DestinationProjectSelect';
import VolumeDescriptionInput from './components/VolumeDescriptionInput';
import VolumeNameInput from './components/VolumeNameInput';

const ProjectAndVolumeStep: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title className="pf-v6-u-mb-md" headingLevel="h2">
        {t('Project & volume')}
      </Title>
      <Form>
        <VolumeNameInput />
        <VolumeDescriptionInput />
        <DestinationProjectSelect />
      </Form>
    </>
  );
};

export default ProjectAndVolumeStep;
