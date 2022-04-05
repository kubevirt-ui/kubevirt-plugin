import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm';

type WorkloadProfileProps = {
  annotations: {
    [key: string]: string;
  };
};

const WorkloadProfile: React.FC<WorkloadProfileProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  const workloadProfile = annotations?.[VM_WORKLOAD_ANNOTATION];

  return <div>{workloadProfile ?? <div className="text-muted">{t('Not available')} </div>}</div>;
};

export default WorkloadProfile;
