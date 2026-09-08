import React, { type FC } from 'react';
import useCanCreateVMNetwork from 'src/views/vmnetworks/hooks/useCanCreateVMNetwork';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import CreateNetworkButton from '../CreateNetworkButton';

import NoPhysicalNetworkAlert from './NoPhysicalNetworkAlert';

const LocalnetEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  const kind = t('OVN localnet network');

  const { showNoPhysicalNetworkAlert } = useCanCreateVMNetwork();

  return (
    <ListEmptyState
      bodyContent={
        showNoPhysicalNetworkAlert ? (
          <NoPhysicalNetworkAlert />
        ) : (
          t('To get started, create a network.')
        )
      }
      buttonAction={<CreateNetworkButton />}
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
