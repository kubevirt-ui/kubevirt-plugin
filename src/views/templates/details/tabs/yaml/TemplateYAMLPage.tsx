import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type TemplateYAMLPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj: V1Template;
};

const TemplateYAMLPage: React.FC<TemplateYAMLPageProps> = ({ obj: template }) => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Loading />
      </Bullseye>
    }
  >
    <ResourceYAMLEditor initialResource={template} />
  </React.Suspense>
);

export default TemplateYAMLPage;
