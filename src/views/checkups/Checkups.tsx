import React, { FC, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  DocumentTitle,
  HorizontalNav,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import { getCheckUpTabs } from './utils/getCheckUpsTabs';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC = () => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isACMpage = useIsACMPage();

  const pages = useMemo(() => getCheckUpTabs(t), [t]);

  // Redirect to default tab if URL is just /checkups
  useEffect(() => {
    if (isACMpage) return;

    const normalizedPath = location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    if (normalizedPath.endsWith('/checkups')) {
      const defaultTab = pages[0];
      if (defaultTab?.href) {
        navigate(`${normalizedPath}/${defaultTab.href}`, { replace: true });
      }
    }
  }, [location.pathname, pages, navigate, isACMpage]);

  return (
    <>
      <DocumentTitle>{PageTitles.Checkups}</DocumentTitle>
      <ClusterProjectDropdown includeAllClusters={false} includeAllProjects={false} />
      <ListPageHeader title={PageTitles.Checkups}>
        <CheckupsRunButton />
      </ListPageHeader>
      <HorizontalNav pages={pages} />
    </>
  );
};

export default CheckupsList;
