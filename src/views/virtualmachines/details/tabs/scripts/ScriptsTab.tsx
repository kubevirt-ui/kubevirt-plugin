import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useImmer } from 'use-immer';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Cloudinit from '@kubevirt-utils/components/CloudInit/CloudInit';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { k8sGet, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import ScriptsTabFooter from './components/ScriptsTabFooter';
import { changeVMSecret } from './utils';

import './scripts-tab.scss';

type VirtualMachineScriptPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const ScriptsTab: React.FC<VirtualMachineScriptPageProps> = ({ obj: vm }) => {
  const [sshKey, setSSHKey] = React.useState('');
  const initialSSHKey = React.useRef('');
  const vmSecret = React.useRef<IoK8sApiCoreV1Secret>();
  const [vmCopy, setVMCopy] = useImmer(vm);

  const sshKeyChanged = sshKey !== initialSSHKey.current;

  React.useEffect(() => {
    if (vm) {
      setVMCopy(vm);

      const sshKeyCredential =
        vm.spec?.template?.spec?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName;

      if (sshKeyCredential)
        k8sGet<IoK8sApiCoreV1Secret>({
          model: SecretModel,
          name: sshKeyCredential,
          ns: vm.metadata.namespace,
        }).then((secret) => {
          const data = atob(secret?.data?.key);
          initialSSHKey.current = data;
          setSSHKey(data || '');
          vmSecret.current = secret;
        });
    }
  }, [setVMCopy, vm]);

  const onSave = async () => {
    const vmToProcess = vmCopy;
    if (sshKeyChanged) {
      const newSecret = await changeVMSecret(vm, vmSecret.current, sshKey);

      vmSecret.current = newSecret;
      initialSSHKey.current = sshKey;
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

  const isSaveDisabled =
    JSON.stringify(vm?.spec?.template?.spec) === JSON.stringify(vmCopy?.spec?.template?.spec) &&
    !sshKeyChanged;

  return (
    <div className="co-m-pane__body vm-scripts-tab">
      <Cloudinit vm={vmCopy} updateVM={setVMCopy} loaded sshKey={sshKey} setSSHKey={setSSHKey} />

      <ScriptsTabFooter isSaveDisabled={isSaveDisabled} onSave={onSave} onReload={onReload} />
    </div>
  );
};

export default ScriptsTab;
