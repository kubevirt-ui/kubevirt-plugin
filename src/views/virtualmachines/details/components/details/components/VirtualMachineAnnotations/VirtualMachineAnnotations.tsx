import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type VirtualMachineLAnnotationsProps = {
  annotations?: { [key: string]: string };
};

const VirtualMachineLAnnotations: React.FC<VirtualMachineLAnnotationsProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  const keys = Object.keys(annotations || {});
  return <Link to="#">{t(`${keys?.length} Annotations`)}</Link>;
};

export default VirtualMachineLAnnotations;
