import React, { FCC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getUID } from '@kubevirt-utils/resources/shared';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import './virtual-machine-yaml-page.scss';

const VirtualMachineYAMLPage: FCC<NavPageComponentProps> = (props) => {
  const { obj: vm } = props;

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
        <ResourceYAMLEditor initialResource={vm} key={getUID(vm)} />
      </div>
    </React.Suspense>
  );
};

export default VirtualMachineYAMLPage;
