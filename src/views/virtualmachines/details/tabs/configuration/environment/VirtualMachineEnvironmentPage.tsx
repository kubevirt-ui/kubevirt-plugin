import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, PageSection } from '@patternfly/react-core';

import { ConfigurationInnerTabProps } from '../utils/types';

const VirtualMachineEnvironmentPage: React.FC<ConfigurationInnerTabProps> = ({ vm }) => {
  const updateVM = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM.metadata.name,
      ns: updatedVM.metadata.namespace,
    });

  if (!vm)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <PageSection>
      <EnvironmentForm updateVM={updateVM} vm={vm} />
    </PageSection>
  );
};

export default VirtualMachineEnvironmentPage;
