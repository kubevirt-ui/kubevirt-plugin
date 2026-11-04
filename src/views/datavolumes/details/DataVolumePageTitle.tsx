import type { FC } from 'react';
import { Link } from 'react-router';

import { DataVolumeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Label, Title } from '@patternfly/react-core';

import DataVolumeActions from '../actions/DataVolumeActions';
import { getDataVolumePhase, getDataVolumePhaseLabel } from '../utils';

type DataVolumePageTitleProps = {
  dataVolume: V1beta1DataVolume;
  name: string;
  namespace: string;
};

const DataVolumePageTitle: FC<DataVolumePageTitleProps> = ({ dataVolume, name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const ns = namespace || DEFAULT_NAMESPACE;
  const phase = getDataVolumePhase(dataVolume);
  const phaseLabel = getDataVolumePhaseLabel(phase, t);

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/k8s/ns/${ns}/${DataVolumeModelRef}`}>{t('DataVolumes')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataVolume details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title className="co-resource-item" headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DV')}</span>
          <span data-test="resource-title">{name ?? dataVolume?.metadata?.name} </span>
          {phase && (
            <span className="dps-resource-item__resource-status pf-v6-u-display-none pf-v6-u-display-inline-on-md">
              <Label color={phaseLabel.color} isCompact>
                {phaseLabel.text}
              </Label>
            </span>
          )}
        </Title>
        <DataVolumeActions dataVolume={dataVolume} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default DataVolumePageTitle;
