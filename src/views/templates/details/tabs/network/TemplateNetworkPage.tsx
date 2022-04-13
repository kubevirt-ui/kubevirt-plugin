import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';

type TemplateNetworkProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateNetwork: React.FC<TemplateNetworkProps> = () => {
  return <div>TemplateNetworkTAB</div>;
};

export default TemplateNetwork;
