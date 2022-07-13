import React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OverviewDetailItem } from '@openshift-console/plugin-shared';
import {
  Alert,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Divider,
  Popover,
  PopoverPosition,
  Skeleton,
} from '@patternfly/react-core';

import { useKubevirtCSVDetails } from '../../utils/hooks/useKubevirtCSVDetails';

import SourceMissingStatus from './components/SourceMissingStatus';
import SubscriptionStatus from './components/SubscriptionStatus';

import './general-tab.scss';

const GeneralTab = () => {
  const { t } = useKubevirtTranslation();
  const {
    displayName,
    provider,
    version,
    updateChannel,
    operatorLink,
    kubevirtSubscription,
    catalogSourceMissing,
    loaded,
    loadErrors,
  } = useKubevirtCSVDetails();

  const isLoaded = loaded && kubevirtSubscription;

  return (
    <>
      <OverviewDetailItem isLoading={!isLoaded} title={t('Service name')}>
        {displayName}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!isLoaded} title={t('Provider')}>
        {provider}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!isLoaded} title={t('Installed version')}>
        {version}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!isLoaded} title={t('Update status')}>
        {catalogSourceMissing ? (
          <SourceMissingStatus />
        ) : (
          <SubscriptionStatus subscription={kubevirtSubscription} operatorLink={operatorLink} />
        )}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              position={PopoverPosition.right}
              bodyContent={t('The channel to track and receive the updates from.')}
            >
              <DescriptionListTermHelpTextButton>{t('Channel')}</DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {isLoaded ? (
              <ExternalLink href={operatorLink}>{updateChannel}</ExternalLink>
            ) : (
              <Skeleton />
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      {!isEmpty(loadErrors) && (
        <Alert
          variant={AlertVariant.danger}
          isInline
          title={t('Error')}
          className="live-migration-tab--error"
        >
          {loadErrors.map((error) => (
            <div key={error?.message}>{error?.message}</div>
          ))}
        </Alert>
      )}
    </>
  );
};

export default GeneralTab;
