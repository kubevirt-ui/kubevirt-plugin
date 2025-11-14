import * as React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { ApplicationAwareQuota } from '../form/types';

import QuotaDetailsTab from './tabs/QuotaDetailsTab/QuotaDetailsTab';
import QuotaYAMLTab from './tabs/QuotaYAMLPage';
import QuotaPageTitle from './QuotaPageTitle';

const QuotaDetailsPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { name, ns: namespace } = useParams<{ name: string; ns?: string }>();

  // If namespace is undefined, it's a cluster-scoped quota (all-namespaces route)
  const isClusterScopedRoute = !namespace;

  const model = isClusterScopedRoute
    ? ApplicationAwareClusterResourceQuotaModel
    : ApplicationAwareResourceQuotaModel;

  const [quota, loaded] = useK8sWatchResource<ApplicationAwareQuota>({
    groupVersionKind: modelToGroupVersionKind(model),
    name,
    namespace: isClusterScopedRoute ? undefined : namespace,
  });

  const pages = React.useMemo(
    () => [
      {
        component: QuotaDetailsTab,
        href: '',
        name: t('Details'),
      },
      {
        component: QuotaYAMLTab,
        href: 'yaml',
        name: t('YAML'),
      },
    ],
    [t],
  );

  return (
    <>
      <QuotaPageTitle name={name} namespace={namespace} quota={quota} />
      {loaded ? (
        <HorizontalNav pages={pages} resource={quota} />
      ) : (
        <Bullseye>
          <Loading />
        </Bullseye>
      )}
    </>
  );
};

export default QuotaDetailsPage;
