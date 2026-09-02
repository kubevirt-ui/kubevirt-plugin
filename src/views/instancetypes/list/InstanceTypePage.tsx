import React, { type FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import classNames from 'classnames';

import {
  VirtualMachineClusterInstancetypeModel,
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useIsCRDPage from '@kubevirt-utils/hooks/useIsCRDPage';
import useIsSearchPage from '@kubevirt-utils/hooks/useIsSearchPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVirtualMachineInstanceTypes from '@kubevirt-utils/hooks/useVirtualMachineInstanceTypes';
import { type ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DocumentTitle,
  ListPageHeader,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import ClusterInstancetypeList from './ClusterInstancetypeList';
import InstancetypeCreateButton from './components/InstancetypeCreateButton/InstancetypeCreateButton';
import { CLUSTER_INSTANCETYPE_TAB_INDEX, USER_INSTANCETYPE_TAB_INDEX } from './constants';
import useTabsPaths from './hooks/useTabsPaths';
import UserInstancetypeList from './UserInstancetypeList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const InstanceTypePage: FC<ListPageProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { fieldSelector, selector } = props;

  const [activeNamespace] = useActiveNamespace();

  const isSearchPage = useIsSearchPage();
  const isCRDPage = useIsCRDPage();

  const activeTabKey = useMemo(
    () =>
      location?.pathname.includes(VirtualMachineClusterInstancetypeModel.kind)
        ? CLUSTER_INSTANCETYPE_TAB_INDEX
        : USER_INSTANCETYPE_TAB_INDEX,
    [location?.pathname],
  );
  const [instanceTypes, loaded, loadError] = useVirtualMachineInstanceTypes({
    fieldSelector,
    namespace: activeNamespace,
    selector,
  });

  const tabsPaths = useTabsPaths();

  if (isSearchPage) {
    const searchParams = new URLSearchParams(location?.search);

    const kindSearched = searchParams.get('kind');
    return kindSearched === VirtualMachineClusterInstancetypeModelRef ? (
      <ClusterInstancetypeList {...props} />
    ) : (
      <UserInstancetypeList
        {...props}
        instanceTypes={instanceTypes}
        loaded={loaded}
        loadError={loadError}
      />
    );
  }

  if (isCRDPage) {
    return location?.pathname?.includes(VirtualMachineClusterInstancetypeModel.plural) ? (
      <ClusterInstancetypeList {...props} />
    ) : (
      <UserInstancetypeList
        {...props}
        instanceTypes={instanceTypes}
        loaded={loaded}
        loadError={loadError}
      />
    );
  }

  const pageTitle =
    activeTabKey === CLUSTER_INSTANCETYPE_TAB_INDEX
      ? PageTitles.VirtualMachineClusterInstanceTypes
      : PageTitles.VirtualMachineInstanceTypes;

  return (
    <>
      <DocumentTitle>{pageTitle}</DocumentTitle>

      <div
        className={classNames({
          'list-header-spacer': activeTabKey === CLUSTER_INSTANCETYPE_TAB_INDEX,
        })}
      >
        <ListPageHeader title={pageTitle}>
          {(activeTabKey === CLUSTER_INSTANCETYPE_TAB_INDEX ||
            (!isEmpty(instanceTypes) && loaded && !loadError)) && (
            <InstancetypeCreateButton namespace={activeNamespace} />
          )}
        </ListPageHeader>
      </div>
      <Tabs
        activeKey={activeTabKey}
        className="co-horizontal-nav"
        onSelect={(_event, tabIndex: number | string) => {
          navigate(tabsPaths[tabIndex]);
        }}
        style={{ flexShrink: 0 }}
        usePageInsets
      >
        <Tab
          eventKey={CLUSTER_INSTANCETYPE_TAB_INDEX}
          title={<TabTitleText>{t('Cluster InstanceTypes')}</TabTitleText>}
        >
          <ClusterInstancetypeList {...props} />
        </Tab>
        <Tab
          eventKey={USER_INSTANCETYPE_TAB_INDEX}
          title={<TabTitleText>{t('User InstanceTypes')}</TabTitleText>}
        >
          <UserInstancetypeList
            {...props}
            instanceTypes={instanceTypes}
            loaded={loaded}
            loadError={loadError}
          />
        </Tab>
      </Tabs>
    </>
  );
};

export default InstanceTypePage;
