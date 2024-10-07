import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachineClusterPreferenceModelRef,
  VirtualMachinePreferenceModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useIsSearchPage from '@kubevirt-utils/hooks/useIsSearchPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import PreferenceCreateButton from './components/PreferenceCreateButton';
import ClusterPreferenceList from './ClusterPreferenceList';
import UserPreferenceList from './UserPreferenceList';

import '@kubevirt-utils/styles/list-managment-group.scss';

const PreferencePage: FC<ListPageProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeNamespace = props?.namespace ?? ALL_NAMESPACES_SESSION_KEY;

  const isSearchPage = useIsSearchPage();

  const activeTabKey = useMemo(
    () =>
      location?.pathname.includes(VirtualMachineClusterPreferenceModelGroupVersionKind.kind)
        ? 0
        : 1,
    [location?.pathname],
  );
  const [userPreferences, loaded, loadError] = useUserPreferences(
    activeNamespace,
    props?.fieldSelector,
    props?.selector,
  );

  const urlUserPreference = useMemo(
    () =>
      activeNamespace === ALL_NAMESPACES_SESSION_KEY
        ? `/k8s/all-namespaces/${VirtualMachinePreferenceModelRef}`
        : `/k8s/ns/${activeNamespace}/${VirtualMachinePreferenceModelRef}`,
    [activeNamespace],
  );

  if (isSearchPage) {
    const searchParams = new URLSearchParams(location?.search);

    const kindSearched = searchParams.get('kind');
    return kindSearched === VirtualMachineClusterPreferenceModelRef ? (
      <ClusterPreferenceList {...props} />
    ) : (
      <UserPreferenceList {...props} />
    );
  }

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
          navigate(
            tabIndex === 0
              ? `/k8s/cluster/${VirtualMachineClusterPreferenceModelRef}`
              : urlUserPreference,
          );
        }}
        activeKey={activeTabKey}
        style={{ flexShrink: 0 }}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Cluster preferences')}</TabTitleText>}>
          <ClusterPreferenceList {...props} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('User preferences')}</TabTitleText>}>
          <UserPreferenceList {...props} />
        </Tab>
      </Tabs>
    </>
  );
};

export default PreferencePage;
