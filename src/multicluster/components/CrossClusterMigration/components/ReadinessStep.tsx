import React, { FC } from 'react';
import { Updater } from 'use-immer';

import { V1beta1Plan } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

type ReadinessStepProps = {
  migrationPlan: V1beta1Plan;
  setMigrationPlan: Updater<V1beta1Plan>;
  vms: V1VirtualMachine[];
};

const ReadinessStep: FC<ReadinessStepProps> = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Title className="cross-cluster-migration-title" headingLevel="h4">
        {t('Migration readiness')}
      </Title>
    </>
  );
};

export default ReadinessStep;
