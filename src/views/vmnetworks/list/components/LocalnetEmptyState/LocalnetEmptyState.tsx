import React, { FC } from 'react';
import useCanCreateVMNetwork from 'src/views/vmnetworks/hooks/useCanCreateVMNetwork';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import NoPhysicalNetworkAlert from './NoPhysicalNetworkAlert';

type LocalnetEmptyStateProps = {
  onCreate: () => void;
};

const LocalnetEmptyState: FC<LocalnetEmptyStateProps> = ({ onCreate }) => {
  const { t } = useKubevirtTranslation();

  const kind = t('OVN localnet network');
  const createButtonText = t('Create network');

  const { canCreate, showNoPhysicalNetworkAlert } = useCanCreateVMNetwork();

  return (
    <ListEmptyState
      bodyContent={
        showNoPhysicalNetworkAlert ? (
          <NoPhysicalNetworkAlert />
        ) : (
          t('To get started, create a network.')
        )
      }
      buttonAction={
        <Button isDisabled={!canCreate} onClick={onCreate}>
          {createButtonText}
        </Button>
      }
      learnMoreLink={
        <ExternalLink href={documentationURL.NETWORKING}>
          {t('Learn more about {{ kind }}', { kind })}
        </ExternalLink>
      }
      titleText={t("You don't have any {{kind}} yet", { kind })}
    />
  );
};

export default LocalnetEmptyState;
