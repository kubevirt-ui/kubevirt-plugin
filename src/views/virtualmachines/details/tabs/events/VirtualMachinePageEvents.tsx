import React, { FC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import './VirtualMachinePageEventsTab.scss';

const VirtualMachinePageEventsTab: FC<NavPageComponentProps> = ({ vm }) => {
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
        {vm?.metadata && <ResourceEventStream resource={vm} />}
      </Suspense>
    </>
  );
};

export default VirtualMachinePageEventsTab;
