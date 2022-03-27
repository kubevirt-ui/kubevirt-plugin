import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import CloudinitForm from './CloudinitForm';
import CloudInitInfoHelper from './CloudinitInfoHelper';

import './cloud-init.scss';

type CloudinitProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
};

const Cloudinit: React.FC<CloudinitProps> = ({ vm, updateVM }) => {
  const cloudInitVolume = getVolumes(vm).find((vol) => !!vol.cloudInitNoCloud);

  return (
    <>
      <CloudInitInfoHelper />
      <div className="kv-cloudinit-advanced-tab--main">
        <CloudinitForm cloudInitVolume={cloudInitVolume} updateVM={updateVM} />
      </div>
    </>
  );
};

export default Cloudinit;
