import React, { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import AddNetworkInterfaceButton from './components/AddNetworkInterfaceButton';
import NetworkInterfaceList from './components/list/NetworkInterfaceList';

import './network-tab.scss';

const NetworkTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
      resource={vm}
    >
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h2">
          <SearchItem id="network">{t('Network interfaces')}</SearchItem>
        </Title>
        <AddNetworkInterfaceButton vm={vm} vmi={vmi} />
        <NetworkInterfaceList vm={vm} vmi={vmi} />
      </PageSection>
    </SidebarEditor>
  );
};

export default NetworkTab;
