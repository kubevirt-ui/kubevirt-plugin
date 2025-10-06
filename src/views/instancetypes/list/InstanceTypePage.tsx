import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';
import VirtualMachineClusterInstancetypeModel, {
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useIsSearchPage from '@kubevirt-utils/hooks/useIsSearchPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DocumentTitle,
  ListPageHeader,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import InstancetypeCreateButton from './components/InstancetypeCreateButton/InstancetypeCreateButton';
import useTabsPaths from './hooks/useTabsPaths';
import ClusterInstancetypeList from './ClusterInstancetypeList';
import { CLUSTER_INSTANCETYPE_TAB_INDEX, USER_INSTANCETYPE_TAB_INDEX } from './constants';
import UserInstancetypeList from './UserInstancetypeList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const InstanceTypePage: FC<ListPageProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { fieldSelector, selector } = props;

  const [activeNamespace] = useActiveNamespace();

  const isSearchPage = useIsSearchPage();

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

  const pageTitle =
    activeTabKey === CLUSTER_INSTANCETYPE_TAB_INDEX
      ? PageTitles.VirtualMachineClusterInstanceTypes
      : PageTitles.VirtualMachineInstanceTypes;

  return (
    <>
      <DocumentTitle>{pageTitle}</DocumentTitle>

      <ClusterProjectDropdown
        includeAllClusters
        includeAllProjects
        showProjectDropdown={activeTabKey === USER_INSTANCETYPE_TAB_INDEX}
      />
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
        onSelect={(_, tabIndex: number | string) => {
          navigate(tabsPaths[tabIndex]);
        }}
        activeKey={activeTabKey}
        className="co-horizontal-nav"
        style={{ flexShrink: 0 }}
      >
        <Tab
          title={
            <TabTitleText data-test="cluster-instancetype-tab">
              {t('Cluster InstanceTypes')}
            </TabTitleText>
          }
          eventKey={CLUSTER_INSTANCETYPE_TAB_INDEX}
        >
          <ClusterInstancetypeList {...props} />
        </Tab>
        <Tab
          title={
            <TabTitleText data-test="user-instancetype-tab">{t('User InstanceTypes')}</TabTitleText>
          }
          eventKey={USER_INSTANCETYPE_TAB_INDEX}
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
