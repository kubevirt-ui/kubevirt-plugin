/* eslint-disable */
import React, { FC, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { load } from 'js-yaml';

import { TemplateModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import {
  TELEMETRY_RESOURCE_CREATION_METHOD,
  TELEMETRY_RESOURCE_TYPE,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logResourceCreated } from '@kubevirt-utils/extensions/telemetry/yaml-vs-ui';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getTemplateURL } from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { defaultVMTemplateYamlTemplate } from '../../../../templates';

const TemplateYAMLCreatePage: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();
  const [error, setError] = useState<Error | null>(null);
  const initialResource = useMemo(() => load(defaultVMTemplateYamlTemplate) as V1Template, []);

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      const template = load(yaml) as V1Template;
      const createdTemplate = await kubevirtK8sCreate({
        cluster,
        data: template,
        model: TemplateModel,
        ns: namespace,
      });

      logResourceCreated(TELEMETRY_RESOURCE_TYPE.TEMPLATE, TELEMETRY_RESOURCE_CREATION_METHOD.YAML);

      const templateCluster = getCluster(createdTemplate) || cluster;
      navigate(getTemplateURL(getName(createdTemplate), namespace, templateCluster));
    } catch (apiError) {
      setError(apiError as Error);
    }
  };

  return (
    <>
      <ResourceYAMLEditor
        create
        header={t('Create Template')}
        initialResource={initialResource}
        onSave={onSave}
      />
      {error && <ErrorAlert error={error} />}
    </>
  );
};

export default TemplateYAMLCreatePage;
