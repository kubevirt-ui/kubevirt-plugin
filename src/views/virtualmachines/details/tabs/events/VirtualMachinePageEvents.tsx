import React, { FC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';
import { FleetResourceEventStream } from '@stolostron/multicluster-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import './VirtualMachinePageEventsTab.scss';

const VirtualMachinePageEventsTab: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title className="virtual-machine-page-events-tab__title" headingLevel="h2">
        {t('Events')}
      </Title>
      <Suspense
        fallback={
          <Bullseye>
            <Loading />
          </Bullseye>
        }
      >
        {getCluster(vm) ? (
          <FleetResourceEventStream resource={vm} />
        ) : (
          <ResourceEventStream resource={vm} />
        )}
      </Suspense>
    </>
  );
};

export default VirtualMachinePageEventsTab;
