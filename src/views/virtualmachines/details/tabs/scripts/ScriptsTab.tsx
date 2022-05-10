import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useImmer } from 'use-immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import Cloudinit from './components/CloudInit';
import ScriptsTabFooter from './components/ScriptsTabFooter';

type VirtualMachineScriptPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const ScriptsTab: React.FC<VirtualMachineScriptPageProps> = ({ obj: vm }) => {
  const [vmCopy, setVMCopy] = useImmer(vm);

  React.useEffect(() => {
    if (vm) {
      setVMCopy(vm);
    }
  }, [setVMCopy, vm]);

  const onSave = async () => {
    console.log('Save');

    await k8sUpdate({
      model: VirtualMachineModel,
      data: vmCopy,
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

  const isSaveDisabled = JSON.stringify(vm) === JSON.stringify(vmCopy);
  return (
    <div className="co-m-pane__body">
      <Cloudinit vm={vmCopy} updateVM={setVMCopy} loaded />

      <ScriptsTabFooter isSaveDisabled={isSaveDisabled} onSave={onSave} onReload={onReload} />
    </div>
  );
};

export default ScriptsTab;
