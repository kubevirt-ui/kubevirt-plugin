import React, { FC, Suspense } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';

import './VirtualMachinePageEventsTab.scss';

type VirtualMachinePageEventsTabProps = {
  obj: V1VirtualMachine;
};

const VirtualMachinePageEventsTab: FC<VirtualMachinePageEventsTabProps> = ({ obj: vm }) => {
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
