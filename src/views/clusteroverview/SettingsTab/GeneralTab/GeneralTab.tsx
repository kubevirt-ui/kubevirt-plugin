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
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { useKubevirtCSVDetails } from '../../utils/hooks/useKubevirtCSVDetails';

import SourceMissingStatus from './components/SourceMissingStatus';
import SubscriptionStatus from './components/SubscriptionStatus';

import './general-tab.scss';

const GeneralTab = () => {
  const { t } = useKubevirtTranslation();
  const {
    version,
    updateChannel,
    operatorLink,
    kubevirtSubscription,
    catalogSourceMissing,
    loaded,
    loadErrors,
  } = useKubevirtCSVDetails();

  return (
    <Split hasGutter className="general-tab">
      <SplitItem>
        <OverviewDetailItem isLoading={!loaded} title={t('Installed version')}>
          {version}
        </OverviewDetailItem>
      </SplitItem>
      <Divider className="general-tab__divider" orientation={{ default: 'vertical' }} />
      <SplitItem>
        <OverviewDetailItem isLoading={!loaded} title={t('Update status')}>
          {catalogSourceMissing ? (
            <SourceMissingStatus />
          ) : (
            <SubscriptionStatus subscription={kubevirtSubscription} operatorLink={operatorLink} />
          )}
        </OverviewDetailItem>
      </SplitItem>
      <Divider orientation={{ default: 'vertical' }} />
      <SplitItem>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTermHelpText>
              <Popover
                position={PopoverPosition.right}
                bodyContent={t('The channel to track and receive the updates from.')}
              >
                <DescriptionListTermHelpTextButton>
                  {t('Channel')}
                </DescriptionListTermHelpTextButton>
              </Popover>
            </DescriptionListTermHelpText>
            <DescriptionListDescription>
              {loaded ? (
                <ExternalLink href={operatorLink}>{updateChannel}</ExternalLink>
              ) : (
                <Skeleton />
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </SplitItem>
      {!isEmpty(loadErrors) && loaded && (
        <Alert
          variant={AlertVariant.danger}
          isInline
          title={t('Error')}
          className="live-migration-tab--error"
        >
          {loadErrors.toString()}
        </Alert>
      )}
    </Split>
  );
};

export default GeneralTab;
