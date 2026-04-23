import React, { FC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getUID } from '@kubevirt-utils/resources/shared';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import './virtual-machine-yaml-page.scss';

const VirtualMachineYAMLPage: FC<NavPageComponentProps> = (props) => {
  const { obj: vm } = props;

  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !vm ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <div className="VirtualMachineYAML--main">
        <ResourceYAMLEditor initialResource={vm} key={getUID(vm)} />
      </div>
    </Suspense>
  );
};

export default VirtualMachineYAMLPage;
