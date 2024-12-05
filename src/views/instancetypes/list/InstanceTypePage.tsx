import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';
import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel, {
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useIsSearchPage from '@kubevirt-utils/hooks/useIsSearchPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSetDefaultNonAdminUserProject from '@kubevirt-utils/hooks/useSetDefaultNonAdminUserProject/useSetDefaultNonAdminUserProject';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageHeader, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import InstancetypeCreateButton from './components/InstancetypeCreateButton/InstancetypeCreateButton';
import ClusterInstancetypeList from './ClusterInstancetypeList';
import UserInstancetypeList from './UserInstancetypeList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const InstanceTypePage: FC<ListPageProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNamespace] = useActiveNamespace();
  const currentNamespace = props?.namespace ?? activeNamespace ?? ALL_NAMESPACES;

  const isSearchPage = useIsSearchPage();

  const activeTabKey = useMemo(
    () =>
      location?.pathname.includes(VirtualMachineClusterInstancetypeModel.kind) && isAdmin ? 0 : 1,
    [location?.pathname],
  );

  useSetDefaultNonAdminUserProject();
  const [instanceTypes, loaded, loadError] = useVirtualMachineInstanceTypes(
    props?.fieldSelector,
    props?.selector,
    true,
  );

  const urlUserInstancetypes = useMemo(
    () =>
      currentNamespace === ALL_NAMESPACES
        ? `/k8s/all-namespaces/${VirtualMachineInstancetypeModelRef}`
        : `/k8s/ns/${currentNamespace}/${VirtualMachineInstancetypeModelRef}`,
    [currentNamespace],
  );

  if (isSearchPage) {
    const searchParams = new URLSearchParams(location?.search);

    const kindSearched = searchParams.get('kind');
    return kindSearched === VirtualMachineClusterInstancetypeModelRef ? (
      <ClusterInstancetypeList {...props} />
    ) : (
      <UserInstancetypeList {...props} />
    );
  }

  return (
    <>
      <div className={classNames({ 'list-header-spacer': activeTabKey === 0 })}>
        <ListPageHeader
          title={
            activeTabKey === 0
              ? t('VirtualMachineClusterInstanceTypes')
              : t('VirtualMachineInstanceTypes')
          }
        >
          {(activeTabKey === 0 || (!isEmpty(instanceTypes) && loaded && !loadError)) && (
            <InstancetypeCreateButton namespace={currentNamespace} />
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
        style={{ flexShrink: 0 }}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Cluster provided')}</TabTitleText>}>
          <ClusterInstancetypeList {...props} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('User provided')}</TabTitleText>}>
          <UserInstancetypeList {...props} />
        </Tab>
      </Tabs>
    </>
  );
};

export default InstanceTypePage;
