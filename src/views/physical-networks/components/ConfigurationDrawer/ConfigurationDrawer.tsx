import React, { FC, useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal, ModalBody, ModalHeader, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { ConfigurationDetails } from '../../utils/types';

import DetailsTab from './tabs/DetailsTab';
import EnactmentStateTab from './tabs/EnactmentStateTab/EnactmentStateTab';
import { ConfigurationDrawerTabKey } from './utils/types';

type ConfigurationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedConfiguration: ConfigurationDetails;
};

const ConfigurationDrawer: FC<ConfigurationDrawerProps> = ({
  isOpen,
  onClose,
  selectedConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<ConfigurationDrawerTabKey>(
    ConfigurationDrawerTabKey.Details,
  );

  const handleTabKey = useCallback((_: unknown, tabKey: ConfigurationDrawerTabKey): void => {
    setActiveTabKey(tabKey);
  }, []);

  return (
    <Modal
      aria-label={t('Configuration drawer')}
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right"
      disableFocusTrap
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalHeader>
        <CatalogItemHeader
          className="co-catalog-page__overlay-header"
          title={selectedConfiguration?.configurationName}
        />
      </ModalHeader>
      <ModalBody>
        <Tabs activeKey={activeTabKey} onSelect={handleTabKey}>
          <Tab
            eventKey={ConfigurationDrawerTabKey.Details}
            title={<TabTitleText>{t('Details')}</TabTitleText>}
          >
            <DetailsTab selectedConfiguration={selectedConfiguration} />
          </Tab>
          <Tab
            eventKey={ConfigurationDrawerTabKey.EnactmentState}
            title={<TabTitleText>{t('Enactment state')}</TabTitleText>}
          >
            <EnactmentStateTab selectedConfiguration={selectedConfiguration} />
          </Tab>
        </Tabs>
      </ModalBody>
    </Modal>
  );
};

export default ConfigurationDrawer;
