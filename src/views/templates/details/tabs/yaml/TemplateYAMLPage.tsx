import React, { FC, Suspense } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type TemplateYAMLPageProps = {
  obj: V1Template;
};

const TemplateYAMLPage: FC<TemplateYAMLPageProps> = ({ obj: template }) => (
  <Suspense
    fallback={
      <Bullseye>
        <Loading />
      </Bullseye>
    }
  >
    <ResourceYAMLEditor initialResource={template} />
  </Suspense>
);

export default TemplateYAMLPage;
