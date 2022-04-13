import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';

type TemplateDisksPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateDisksPage: React.FC<TemplateDisksPageProps> = () => {
  return <div>TemplateDisksTab</div>;
};

export default TemplateDisksPage;
