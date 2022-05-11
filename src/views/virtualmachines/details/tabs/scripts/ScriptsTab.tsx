import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useImmer } from 'use-immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Cloudinit from '@kubevirt-utils/components/CloudInit/CloudInit';
import {
  addSecretToVM,
  createVmSSHSecret,
} from '@kubevirt-utils/components/CloudInit/utils/cloudint-utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import ScriptsTabFooter from './components/ScriptsTabFooter';

import './scripts-tab.scss';

type VirtualMachineScriptPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const ScriptsTab: React.FC<VirtualMachineScriptPageProps> = ({ obj: vm }) => {
  const [sshKey, setSSHKey] = React.useState('');
  const [vmCopy, setVMCopy] = useImmer(vm);

  React.useEffect(() => {
    if (vm) {
      setVMCopy(vm);
    }
  }, [setVMCopy, vm]);

  const onSave = async () => {
    let vmToProcess = vmCopy;
    if (sshKey) {
      vmToProcess = addSecretToVM(vmToProcess);

      await createVmSSHSecret(vm, sshKey);
    }

    await k8sUpdate({
      model: VirtualMachineModel,
      data: vmToProcess,
    });
  };

  const onReload = () => {
    setVMCopy(vm);
  };

  if (!vm || Object.keys(vmCopy).length === 0)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  const isSaveDisabled = JSON.stringify(vm) === JSON.stringify(vmCopy) && !sshKey;
  return (
    <div className="co-m-pane__body vm-scripts-tab">
      <Cloudinit vm={vmCopy} updateVM={setVMCopy} loaded sshKey={sshKey} setSSHKey={setSSHKey} />

      <ScriptsTabFooter isSaveDisabled={isSaveDisabled} onSave={onSave} onReload={onReload} />
    </div>
  );
};

export default ScriptsTab;
