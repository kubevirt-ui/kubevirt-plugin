import React, { FC } from 'react';

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

import { SubscriptionKind } from '../../../../../../views/clusteroverview/utils/types';

import SourceMissingStatus from './components/SourceMissingStatus';
import SubscriptionStatus from './components/SubscriptionStatus';

import './general-information.scss';

type GeneralInformationProps = {
  catalogSourceMissing: boolean;
  kubevirtSubscription: SubscriptionKind;
  loaded: boolean;
  loadErrors: Error[];
  operatorLink: string;
  updateChannel: string;
  version: string;
};
const GeneralInformation: FC<GeneralInformationProps> = ({
  catalogSourceMissing,
  kubevirtSubscription,
  loaded,
  loadErrors,
  operatorLink,
  updateChannel,
  version,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Split className="general-tab" hasGutter>
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
            <SubscriptionStatus operatorLink={operatorLink} subscription={kubevirtSubscription} />
          )}
        </OverviewDetailItem>
      </SplitItem>
      <Divider orientation={{ default: 'vertical' }} />
      <SplitItem>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTermHelpText>
              <Popover
                bodyContent={t('The channel to track and receive the updates from.')}
                position={PopoverPosition.right}
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
          className="live-migration-tab--error"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {loadErrors.toString()}
        </Alert>
      )}
    </Split>
  );
};

export default GeneralInformation;
