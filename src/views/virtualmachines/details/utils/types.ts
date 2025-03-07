import { Params } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NavPageComponentProps = {
  obj: V1VirtualMachine;
  params: Params<string>;
};
