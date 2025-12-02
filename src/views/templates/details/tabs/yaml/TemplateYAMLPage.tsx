import React, { FC, Suspense, useCallback, useState } from 'react';
import { load } from 'js-yaml';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getName } from '@kubevirt-utils/resources/shared';
import { updateTemplate } from '@kubevirt-utils/resources/template';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

type TemplateYAMLPageProps = {
  obj: V1Template;
};

const TemplateYAMLPage: FC<TemplateYAMLPageProps> = ({ obj: template }) => {
  const [error, setError] = useState<Error>(null);
  const [success, setSuccess] = useState<string>('');

  const onSave = useCallback(async (yaml: string) => {
    setSuccess('');
    setError(null);

    try {
      const updatedTemplate = await updateTemplate(load(yaml) as V1Template);
      setSuccess(
        `${getName(updatedTemplate)} has been updated to version ${
          updatedTemplate.metadata.resourceVersion
        }`,
      );
    } catch (apiError) {
      setError(apiError);
    }
  }, []);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <ResourceYAMLEditor initialResource={template} onSave={onSave} />
      {success && <Alert title={success} variant={AlertVariant.success} />}
      {error && <ErrorAlert error={error} />}
    </Suspense>
  );
};

export default TemplateYAMLPage;
