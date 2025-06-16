import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';

import { ModalProvider, useModalValue } from '../ModalProvider/ModalProvider';

import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { name, ns } = useParams<{ name: string; ns: string }>();
  const { vmi } = useVMIAndPodsForVM(name, ns);
  const value = useModalValue();

  return (
    <ModalProvider value={value}>
      <Consoles consoleContainerClass="console-container-stand-alone" isStandAlone vmi={vmi} />;
    </ModalProvider>
  );
};

export default ConsoleStandAlone;
