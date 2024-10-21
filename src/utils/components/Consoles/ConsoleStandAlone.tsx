import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';

import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { name, ns } = useParams<{ name: string; ns: string }>();
  const { vmi } = useVMIAndPodsForVM(name, ns);

  return <Consoles isStandAlone vmi={vmi} />;
};

export default ConsoleStandAlone;
