import React, { FC, Suspense } from 'react';
import { load } from 'js-yaml';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { updateTemplate } from '@kubevirt-utils/resources/template';
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
    <ResourceYAMLEditor
      onSave={(yaml: string) => {
        return updateTemplate(load(yaml) as V1Template);
      }}
      initialResource={template}
    />
  </Suspense>
);

export default TemplateYAMLPage;
