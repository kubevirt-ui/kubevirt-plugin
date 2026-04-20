import React, { FCC } from 'react';
import { useLocation, useNavigate } from 'react-router';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkAttachmentDefinitionModel } from '@kubevirt-utils/models';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { ListPageCreateButton, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Button, PopoverPosition, Stack, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { VM_NETWORKS_PATH } from '../constants';
import useCanCreateVMNetwork from '../hooks/useCanCreateVMNetwork';

import { NADS_LIST_PATH, PATH_BY_TAB_INDEX, TAB_INDEX_BY_PATH, TAB_INDEXES } from './constants';
import VMNetworkList from './VMNetworkList';
import VMNetworkOtherTypesList from './VMNetworkOtherTypesList';

const VMNetworksPage: FCC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate } = useCanCreateVMNetwork();

  const locationTabKey = TAB_INDEX_BY_PATH[location?.pathname];

  const onCreate = () => {
    navigate(`${VM_NETWORKS_PATH}/~new`);
  };

  return (
    <>
      <ListPageHeader title={t('Virtual machine networks')}>
        <ListPageCreateButton isDisabled={!canCreate} onClick={onCreate}>
          {t('Create network')}
        </ListPageCreateButton>
      </ListPageHeader>
      <Tabs
        activeKey={locationTabKey}
        onSelect={(_, tabIndex: number | string) => navigate(PATH_BY_TAB_INDEX[tabIndex])}
        unmountOnExit
        usePageInsets
      >
        <Tab
          eventKey={TAB_INDEXES.OVN_LOCALNET}
          title={<TabTitleText>{t('OVN localnet')}</TabTitleText>}
        >
          <VMNetworkList onCreate={onCreate} />
        </Tab>
        <Tab
          title={
            <>
              <TabTitleText className="pf-v6-u-mr-sm">{t('Other VM network types')}</TabTitleText>
              <HelpTextIcon
                bodyContent={(hide) => (
                  <PopoverContentWithLightspeedButton
                    content={
                      <Stack hasGutter>
                        <p>
                          {t(
                            'This list only shows network definitions that are compatible with virtual machines. To view the complete list of all available networks, refer to the full NetworkAttachmentDefinition list.',
                          )}
                        </p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(NADS_LIST_PATH);
                          }}
                          isInline
                          variant="link"
                        >
                          {NetworkAttachmentDefinitionModel.kind}
                        </Button>
                      </Stack>
                    }
                    hide={hide}
                    promptType={OLSPromptType.VM_NETWORK_TYPES}
                  />
                )}
                headerContent={t('Only VM-compatible networks displayed')}
                position={PopoverPosition.right}
              />
            </>
          }
          eventKey={TAB_INDEXES.OTHER_VM_NETWORK_TYPES}
        >
          <VMNetworkOtherTypesList />
        </Tab>
      </Tabs>
    </>
  );
};

export default VMNetworksPage;
