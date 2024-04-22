import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachineClusterPreferenceModelRef,
  VirtualMachinePreferenceModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageHeader, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import PreferenceCreateButton from './components/PreferenceCreateButton';
import ClusterPreferenceList from './ClusterPreferenceList';
import UserPreferenceList from './UserPreferenceList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const PreferencePage = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNamespace] = useActiveNamespace();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    location?.pathname.includes(VirtualMachineClusterPreferenceModelGroupVersionKind.kind) ? 0 : 1,
  );
  const [userPreferences, loaded, loadError] = useUserPreferences(activeNamespace);

  const urlUserPreference = useMemo(
    () =>
      activeNamespace === ALL_NAMESPACES_SESSION_KEY
        ? `/k8s/all-namespaces/${VirtualMachinePreferenceModelRef}`
        : `/k8s/ns/${activeNamespace}/${VirtualMachinePreferenceModelRef}`,
    [activeNamespace],
  );

  useEffect(() => {
    navigate(
      activeTabKey === 0
        ? `/k8s/cluster/${VirtualMachineClusterPreferenceModelRef}`
        : urlUserPreference,
    );
  }, [activeTabKey, navigate, urlUserPreference]);

  return (
    <>
      <div className={classNames({ 'list-header-spacer': activeTabKey === 0 })}>
        <ListPageHeader
          title={
            activeTabKey === 0
              ? t('VirtualMachineClusterPreferences')
              : t('VirtualMachinePreferences')
          }
        >
          {(activeTabKey === 0 || (!isEmpty(userPreferences) && loaded && !loadError)) && (
            <PreferenceCreateButton namespace={activeNamespace} />
          )}
        </ListPageHeader>
      </div>
      <Tabs
        onSelect={(_, tabIndex: number | string) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
        style={{ flexShrink: 0 }}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Cluster preferences')}</TabTitleText>}>
          <ClusterPreferenceList />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('User preferences')}</TabTitleText>}>
          <UserPreferenceList />
        </Tab>
      </Tabs>
    </>
  );
};

export default PreferencePage;
