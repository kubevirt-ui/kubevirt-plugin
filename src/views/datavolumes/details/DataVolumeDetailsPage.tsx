import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { ConditionsTable } from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, Title } from '@patternfly/react-core';

import DataVolumeDetailsGrid from './components/DataVolumeDetailsGrid';

type DataVolumeDetailsPageProps = {
  obj?: V1beta1DataVolume;
};

const DataVolumeDetailsPage: FC<DataVolumeDetailsPageProps> = ({ obj: dataVolume }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {t('DataVolume details')}
        </Title>
        <DataVolumeDetailsGrid dataVolume={dataVolume} />
      </PageSection>
      <Divider />
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {t('Conditions')}
        </Title>
        <ConditionsTable conditions={dataVolume?.status?.conditions} />
      </PageSection>
    </div>
  );
};

export default DataVolumeDetailsPage;
