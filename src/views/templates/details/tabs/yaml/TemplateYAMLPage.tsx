import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { isCommonVMTemplate } from '../../../utils';
import NoEditableTemplateAlert from '../NoEditableTemplateAlert';

type TemplateYAMLPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateYAMLPage: React.FC<TemplateYAMLPageProps> = ({ obj: template }) => {
  const isEditDisabled = isCommonVMTemplate(template);
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {isEditDisabled && <NoEditableTemplateAlert template={template} />}
      <ResourceYAMLEditor initialResource={template} />
    </React.Suspense>
  );
};

export default TemplateYAMLPage;
