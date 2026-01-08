import React, { FC, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

  const pages = useMemo(() => getCheckUpTabs(t), [t]);

  // Remove trailing slash and redirect to default tab if URL is just /checkups
  useEffect(() => {
    // Remove trailing slash if present
    if (location.pathname.endsWith('/')) {
      navigate(location.pathname.slice(0, -1), { replace: true });
      return;
    }

    // Redirect to default tab if URL is just /checkups
    if (location.pathname.endsWith('/checkups')) {
      const defaultTab = pages[0];
      if (defaultTab?.href) {
        navigate(`${location.pathname}/${defaultTab.href}`, { replace: true });
      }
    }
  }, [location.pathname, pages, navigate]);

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
