import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';
import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel, {
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useIsSearchPage from '@kubevirt-utils/hooks/useIsSearchPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DocumentTitle,
  ListPageHeader,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import InstancetypeCreateButton from './components/InstancetypeCreateButton/InstancetypeCreateButton';
import ClusterInstancetypeList from './ClusterInstancetypeList';
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
    () => (location?.pathname.includes(VirtualMachineClusterInstancetypeModel.kind) ? 0 : 1),
    [location?.pathname],
  );
  const [instanceTypes, loaded, loadError] = useVirtualMachineInstanceTypes({
    fieldSelector,
    namespace: activeNamespace,
    selector,
  });

  const urlUserInstancetypes = useMemo(
    () =>
      isAllNamespaces(activeNamespace)
        ? `/k8s/all-namespaces/${VirtualMachineInstancetypeModelRef}`
        : `/k8s/ns/${activeNamespace}/${VirtualMachineInstancetypeModelRef}`,
    [activeNamespace],
  );

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
    activeTabKey === 0
      ? PageTitles.VirtualMachineClusterInstanceTypes
      : PageTitles.VirtualMachineInstanceTypes;

  return (
    <>
      <DocumentTitle>{pageTitle}</DocumentTitle>
      <div className={classNames({ 'list-header-spacer': activeTabKey === 0 })}>
        <ListPageHeader title={pageTitle}>
          {(activeTabKey === 0 || (!isEmpty(instanceTypes) && loaded && !loadError)) && (
            <InstancetypeCreateButton namespace={activeNamespace} />
          )}
        </ListPageHeader>
      </div>
      <Tabs
        onSelect={(_, tabIndex: number | string) => {
          navigate(
            tabIndex === 0
              ? `/k8s/cluster/${VirtualMachineClusterInstancetypeModelRef}`
              : urlUserInstancetypes,
          );
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
          eventKey={0}
        >
          <ClusterInstancetypeList {...props} />
        </Tab>
        <Tab
          title={
            <TabTitleText data-test="user-instancetype-tab">{t('User InstanceTypes')}</TabTitleText>
          }
          eventKey={1}
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
