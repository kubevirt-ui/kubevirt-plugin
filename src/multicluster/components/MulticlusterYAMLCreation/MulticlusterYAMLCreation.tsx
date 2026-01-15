import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { load } from 'js-yaml';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getFleetResourceRoute, getMulticlusterSearchURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useModelFromParam from './hooks/useModelFromParam';
import useYAMLTemplateExtension from './hooks/useYAMLTemplateExtension';

const MulticlusterYAMLCreation: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();
  const [model, loading] = useModelFromParam();
  const { resourceYAMLTemplate, yamlExtensionsResolved } = useYAMLTemplateExtension(model);

  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const [error, setError] = useState<Error>(null);

  const onSave = async (yaml: string) => {
    setError(null);

    if (!model) return;
    try {
      const createdResource = await kubevirtK8sCreate({
        cluster,
        data: load(yaml),
        model,
        ns: namespace,
      });

      const kubevirtURL = getFleetResourceRoute({
        cluster,
        model,
        name: getName(createdResource),
        namespace,
      });

      navigate(
        kubevirtURL ||
          getMulticlusterSearchURL(model, getName(createdResource), namespace, cluster),
      );
    } catch (apiError) {
      setError(apiError);
    }
  };

  if (!yamlExtensionsResolved || loading || !model) return <Loading />;

  return (
    <>
      {isACMPage && (
        <ClusterProjectDropdown
          includeAllClusters={false}
          includeAllProjects={false}
          showProjectDropdown={model?.namespaced}
        />
      )}
      <ResourceYAMLEditor
        create
        header={t('Create {{kind}}', { kind: model.kind })}
        initialResource={resourceYAMLTemplate}
        onSave={onSave}
      />
      {error && <ErrorAlert error={error} />}
    </>
  );
};

export default MulticlusterYAMLCreation;
