import React, { FC, useMemo } from 'react';

import ClusterNamespaceDropdown from '@kubevirt-utils/components/ClusterNamespaceDropdown/ClusterNamespaceDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DocumentTitle,
  HorizontalNav,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsTabsNavigation from './hooks/useCheckupsTabsNavigation';
import { getCheckUpTabs } from './utils/getCheckUpsTabs';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC = () => {
  const { t } = useKubevirtTranslation();

  const pages = useMemo(() => getCheckUpTabs(t), [t]);

  const defaultTab = pages[0]?.href;
  useCheckupsTabsNavigation(defaultTab);

  return (
    <>
      <DocumentTitle>{PageTitles.Checkups}</DocumentTitle>
      <ClusterNamespaceDropdown includeAllClusters={false} includeAllNamespaces={false} />
      <ListPageHeader title={PageTitles.Checkups}>
        <CheckupsRunButton />
      </ListPageHeader>
      <HorizontalNav pages={pages} />
    </>
  );
};

export default CheckupsList;
