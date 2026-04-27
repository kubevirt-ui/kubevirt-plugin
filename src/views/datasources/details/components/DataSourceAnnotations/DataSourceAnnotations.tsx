import React, { FC } from 'react';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DataSourceAnnotationsProps = {
  annotations?: { [key: string]: string };
};

const DataSourceAnnotations: FC<DataSourceAnnotationsProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  const keys = Object.keys(annotations || {});
  return <Link to="#">{t('{{annotations}} Annotations', { annotations: keys?.length })}</Link>;
};

export default DataSourceAnnotations;
