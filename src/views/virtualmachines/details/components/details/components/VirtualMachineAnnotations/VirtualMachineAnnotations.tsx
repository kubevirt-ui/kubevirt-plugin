import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type VirtualMachineAnnotationsProps = {
  annotations?: { [key: string]: string };
};

const VirtualMachineAnnotations: React.FC<VirtualMachineAnnotationsProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  const keys = Object.keys(annotations || {});
  return <Link to="#">{t(`${keys?.length} Annotations`)}</Link>;
};

export default VirtualMachineAnnotations;
