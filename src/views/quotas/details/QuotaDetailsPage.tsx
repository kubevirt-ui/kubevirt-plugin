import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import QuotaDetailsTab from './tabs/QuotaDetailsTab/QuotaDetailsTab';
import QuotaYAMLTab from './tabs/QuotaYAMLTab';
import QuotaPageTitle from './QuotaPageTitle';

const QuotaDetailsPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const { name, ns: namespace } = useParams<{ name: string; ns?: string }>();

  const model = namespace
    ? ApplicationAwareResourceQuotaModel
    : ApplicationAwareClusterResourceQuotaModel;

  const [quota, loaded] = useK8sWatchResource<ApplicationAwareQuota>({
    groupVersionKind: modelToGroupVersionKind(model),
    name,
    namespace,
  });

  const pages = useMemo(
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

  // Cluster-scoped quota only has YAML view
  if (!namespace) {
    return (
      <>
        <QuotaPageTitle name={name} namespace={namespace} quota={quota} />
        <QuotaYAMLTab obj={quota} />
      </>
    );
  }

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
