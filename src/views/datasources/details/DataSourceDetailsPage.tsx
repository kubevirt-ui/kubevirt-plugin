import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { PageSection } from '@patternfly/react-core';

type DataSourceDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1beta1DataSource;
};

const DataSourceDetailsPage: React.FC<DataSourceDetailsPageProps> = ({ obj: dataSource }) => {
  return (
    <div>
      <PageSection>Details {dataSource?.metadata?.name}</PageSection>
    </div>
  );
};

export default DataSourceDetailsPage;
