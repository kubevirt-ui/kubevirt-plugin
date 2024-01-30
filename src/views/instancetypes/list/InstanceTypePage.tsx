import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel, {
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageCreate,
  ListPageHeader,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import ClusterInstancetypeList from './ClusterInstancetypeList';
import UserInstancetypeList from './UserInstancetypeList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const InstanceTypePage = () => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [activeNamespace] = useActiveNamespace();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    history?.location?.pathname.includes(VirtualMachineClusterInstancetypeModel.kind) ? 0 : 1,
  );

  const urlUserPreference = useMemo(
    () =>
      activeNamespace === ALL_NAMESPACES_SESSION_KEY
        ? `/k8s/all-namespaces/${VirtualMachineInstancetypeModelRef}`
        : `/k8s/ns/${activeNamespace}/${VirtualMachineInstancetypeModelRef}`,
    [activeNamespace],
  );

  const groupVersionKind = useMemo(
    () =>
      activeTabKey === 0
        ? VirtualMachineClusterInstancetypeModelRef
        : VirtualMachineInstancetypeModelRef,
    [activeTabKey],
  );

  useEffect(() => {
    history.push(
      activeTabKey === 0
        ? `/k8s/cluster/${VirtualMachineClusterInstancetypeModelRef}`
        : urlUserPreference,
    );
  }, [activeTabKey, history, urlUserPreference]);

  return (
    <>
      <div className={classNames({ 'list-header-spacer': activeTabKey === 0 })}>
        <ListPageHeader
          title={
            activeTabKey === 0
              ? t('VirtualMachineClusterInstancetypes')
              : t('VirtualMachineInstancetypes')
          }
        >
          <ListPageCreate
            createAccessReview={{
              groupVersionKind,
            }}
            groupVersionKind={groupVersionKind}
          >
            {t('Create')}
          </ListPageCreate>
        </ListPageHeader>
      </div>
      <Tabs
        onSelect={(_, tabIndex: number | string) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
        style={{ flexShrink: 0 }}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Cluster provided')}</TabTitleText>}>
          <ClusterInstancetypeList />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('User provided')}</TabTitleText>}>
          <UserInstancetypeList />
        </Tab>
      </Tabs>
    </>
  );
};

export default InstanceTypePage;
