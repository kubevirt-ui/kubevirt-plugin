import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';

import Consoles from './Consoles';

type ConsoleStandAloneProps = RouteComponentProps<{ ns: string; name: string }>;

const ConsoleStandAlone: React.FC<ConsoleStandAloneProps> = ({ match }) => {
  const { ns, name } = match?.params;
  const { vmi } = useVMIAndPodsForVM(name, ns);

  return <Consoles vmi={vmi} />;
};

export default ConsoleStandAlone;
