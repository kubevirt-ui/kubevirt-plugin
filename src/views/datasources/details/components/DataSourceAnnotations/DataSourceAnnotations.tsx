import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DataSourceAnnotationsProps = {
  annotations?: { [key: string]: string };
};

const DataSourceAnnotations: React.FC<DataSourceAnnotationsProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  const keys = Object.keys(annotations || {});
  return <Link to="#">{t('{{count}} Annotations', { count: keys?.length })}</Link>;
};

export default DataSourceAnnotations;
