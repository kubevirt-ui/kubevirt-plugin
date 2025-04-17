import React, { FC } from 'react';
import { PathParam, useParams } from 'react-router-dom-v5-compat';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';
import { Bullseye } from '@patternfly/react-core';
import { FleetSupport } from '@stolostron/multicluster-sdk';

import Loading from '../Loading/Loading';

import Consoles from './Consoles';

export const FLEET_STANDALONE_CONSOLE_PATH =
  '/multicloud/infrastructure/vmconsole/:cluster/:namespace/:name';

const ConsoleStandAlone: FC = () => {
  const { cluster, name, namespace } = useParams<PathParam<typeof FLEET_STANDALONE_CONSOLE_PATH>>();
  const { vmi } = useVMIAndPodsForVM(name, namespace, cluster);

  return <Consoles consoleContainerClass="console-container-stand-alone" isStandAlone vmi={vmi} />;
};

const FleetConsoleStandAlone: FC = () => (
  <FleetSupport
    loading={
      <Bullseye>
        <Loading />
      </Bullseye>
    }
  >
    <ConsoleStandAlone />
  </FleetSupport>
);

export default FleetConsoleStandAlone;
