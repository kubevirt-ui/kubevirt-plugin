import { Params } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type NavPageComponentProps = {
  instanceTypeExpandedSpec?: V1VirtualMachine;
  obj: V1VirtualMachine;
  params: Params<string>;
};
