import { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { CLUSTER_QUOTA_LIST_URL, getQuotaListURL } from '../../utils/url';
import { QuotaScope } from '../constants';

export type UseQuotasListTab = () => {
  activeTab: QuotaScope;
  handleTabSelect: (_event: MouseEvent, tabKey: QuotaScope) => void;
};

const useQuotasListTab: UseQuotasListTab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace;

  const isClusterScoped = location.pathname.includes(CLUSTER_QUOTA_LIST_URL);
  const activeTab = isClusterScoped ? QuotaScope.CLUSTER : QuotaScope.PROJECT;

  const handleTabSelect = (_event: MouseEvent, tabKey: QuotaScope) =>
    navigate(tabKey === QuotaScope.CLUSTER ? CLUSTER_QUOTA_LIST_URL : getQuotaListURL(namespace));

  return { activeTab, handleTabSelect };
};

export default useQuotasListTab;
