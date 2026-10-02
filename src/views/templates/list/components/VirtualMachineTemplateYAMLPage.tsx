import { type FC, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { load } from 'js-yaml';

import { TemplateModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  TELEMETRY_RESOURCE_CREATION_METHOD,
  TELEMETRY_RESOURCE_TYPE,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logResourceCreated } from '@kubevirt-utils/extensions/telemetry/yaml-vs-ui';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateURL } from '@kubevirt-utils/resources/template';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { defaultVMTemplateYamlTemplate } from '../../../../templates/vm-template-yaml';

/**
 * Create VM Template from YAML.
 *
 * Console provides this page for its own `templates` paths only, the plugin owned
 * `vm-templates` paths need their own creation page.
 */
const VirtualMachineTemplateYAMLPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { ns } = useParams<{ ns: string }>();
  const [error, setError] = useState<Error>(null);

  const namespace = ns ?? DEFAULT_NAMESPACE;
  const initialResource = useMemo(() => load(defaultVMTemplateYamlTemplate) as V1Template, []);

  const onSave = async (yaml: string): Promise<void> => {
    setError(null);
    try {
      const createdTemplate = await kubevirtK8sCreate<V1Template>({
        data: load(yaml) as V1Template,
        model: TemplateModel,
        ns: namespace,
      });

      logResourceCreated(TELEMETRY_RESOURCE_TYPE.TEMPLATE, TELEMETRY_RESOURCE_CREATION_METHOD.YAML);

      navigate(
        getTemplateURL(getName(createdTemplate), getNamespace(createdTemplate) ?? namespace),
      );
    } catch (apiError) {
      setError(apiError);
    }
  };

  return (
    <>
      <ResourceYAMLEditor
        create
        header={t('Create {{kind}}', { kind: TemplateModel.kind })}
        initialResource={initialResource}
        onSave={onSave}
      />
      {error && <ErrorAlert error={error} />}
    </>
  );
};

export default VirtualMachineTemplateYAMLPage;
