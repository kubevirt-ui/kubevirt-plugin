import React, { useEffect, useMemo, useState } from 'react';
import { Suspense } from 'react';
import { useMatch } from 'react-router-dom-v5-compat';
import { dump, load } from 'js-yaml';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import {
  ResourceIcon,
  ResourceYAMLEditor,
  useK8sModels,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye, PageBody, Title } from '@patternfly/react-core';

import { getDefaultResource } from './utils';

const MulticlusterCreateFromYAML = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const clusterwideResourceMatch = useMatch('/k8s/cluster/:cluster/:modelRef/*');
  const namespacedResourceMatch = useMatch('/k8s/cluster/:cluster/ns/:namespace/:modelRef/*');

  const [models] = useK8sModels();

  const currentModel = useMemo(
    () =>
      models[clusterwideResourceMatch?.params?.modelRef] ||
      models[namespacedResourceMatch?.params?.modelRef],
    [models, clusterwideResourceMatch?.params?.modelRef, namespacedResourceMatch?.params?.modelRef],
  );

  const [error, setError] = useState<Error>(null);
  const [resource, setResource] = useState<any>(null);

  useEffect(() => {
    setResource(dump(getDefaultResource(currentModel), { skipInvalid: true }));
  }, [currentModel]);

  const onSave = async (yaml: string) => {
    setError(undefined);
    setResource(yaml);

    try {
      await kubevirtK8sCreate({
        cluster,
        data: load(yaml),
        model: currentModel,
      });
    } catch (apiError) {
      setError(apiError);
    }
  };

  return (
    <>
      <PaneHeading>
        <Title headingLevel="h1">
          <ResourceIcon groupVersionKind={modelToGroupVersionKind(currentModel)} />
          {currentModel?.kind}
        </Title>
      </PaneHeading>
      <PageBody>
        <Suspense
          fallback={
            <Bullseye>
              <Loading />
            </Bullseye>
          }
        >
          <div className="yaml-body">
            <ResourceYAMLEditor create hideHeader initialResource={resource} onSave={onSave} />
          </div>
          {error && (
            <div className="yaml-alert">
              <Alert
                title={t(
                  'An error occured, The VirtualMachine was not updated. Click "Reload" to go back to the last valid state',
                )}
                isInline
                variant={AlertVariant.danger}
              >
                {error.message}
              </Alert>
            </div>
          )}
        </Suspense>
      </PageBody>
    </>
  );
};

export default MulticlusterCreateFromYAML;
