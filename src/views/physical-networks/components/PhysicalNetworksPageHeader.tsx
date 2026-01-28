import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Title } from '@patternfly/react-core';

import { NODE_NETWORK_CONFIGURATION_WIZARD_PATH } from '../utils/constants';

type PhysicalNetworksPageHeaderProps = {
  showCreateButton: boolean;
};

const PhysicalNetworksPageHeader: FC<PhysicalNetworksPageHeaderProps> = ({ showCreateButton }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <PaneHeading>
      <Title className="pf-v6-u-mb-xl" data-test-id="resource-title" headingLevel="h1">
        {t('Physical networks')}
      </Title>
      {showCreateButton && (
        <Button
          onClick={() => history.push(NODE_NETWORK_CONFIGURATION_WIZARD_PATH)}
          variant="primary"
        >
          {t('Create network')}
        </Button>
      )}
    </PaneHeading>
  );
};

export default PhysicalNetworksPageHeader;
