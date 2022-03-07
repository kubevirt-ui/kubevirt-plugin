import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview, OverviewGrid } from '@openshift-console/dynamic-plugin-sdk';

import PageHeader from './PageHeader';

const leftCards = [];
const mainCards = [];
const rightCards = [];

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const title = t('Virtualization Overview');

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageHeader title={title} />
      <Overview>
        <OverviewGrid leftCards={leftCards} mainCards={mainCards} rightCards={rightCards} />
      </Overview>
    </>
  );
};

export default ClusterOverviewPage;
