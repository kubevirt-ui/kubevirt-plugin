import * as React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

type DataSourcePageTitleProps = {
  dataSource: V1beta1DataSource;
};

const DataSourcePageTitle: React.FC<DataSourcePageTitleProps> = ({ dataSource }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DS')}</span>
          {dataSource?.metadata?.name}{' '}
          <Label color="green" isCompact>
            {
              dataSource?.status?.conditions?.find((c) => c.type === 'Ready' && c.status === 'True')
                ?.type
            }
          </Label>
        </h1>
        Actions
      </span>
    </div>
  );
};

export default DataSourcePageTitle;
