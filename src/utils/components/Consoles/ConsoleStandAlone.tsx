import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';

import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { cluster, name, ns } = useParams<{ cluster?: string; name: string; ns: string }>();
  const { vmi } = useVMIAndPodsForVM(name, ns, cluster);

  return <Consoles consoleContainerClass="console-container-stand-alone" isStandAlone vmi={vmi} />;
};

export default ConsoleStandAlone;
