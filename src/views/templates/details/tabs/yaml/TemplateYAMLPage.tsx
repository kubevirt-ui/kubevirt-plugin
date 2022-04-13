import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';

type TemplateYAMLPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateYAMLPage: React.FC<TemplateYAMLPageProps> = () => {
  return <div>TemplateYAMLTAB</div>;
};

export default TemplateYAMLPage;
