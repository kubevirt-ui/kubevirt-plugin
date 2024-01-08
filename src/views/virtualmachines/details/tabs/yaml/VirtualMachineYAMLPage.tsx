import React, { FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import './virtual-machine-yaml-page.scss';

const VirtualMachineYAMLPage: FC<NavPageComponentProps> = ({ vm }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !vm ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <div className="VirtualMachineYAML--main">
        <ResourceYAMLEditor initialResource={vm} />
      </div>
    </React.Suspense>
  );
};

export default VirtualMachineYAMLPage;
