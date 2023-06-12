import React, { useEffect, useState } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/usePreviewFeatures/constants';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OverviewDetailItem } from '@openshift-console/plugin-shared';
import {
  Alert,
  AlertVariant,
  Checkbox,
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

  const {
    featureEnabled: instanceTypesEnabled,
    toggleFeature: toggleInstanceTypesFeature,
    canEdit,
    loading,
  } = usePreviewFeatures(INSTANCE_TYPE_ENABLED);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsChecked(instanceTypesEnabled);
    }
  }, [loading, instanceTypesEnabled]);

  return (
    <>
      <OverviewDetailItem isLoading={!loaded} title={t('Service name')}>
        {displayName}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!loaded} title={t('Provider')}>
        {provider}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!loaded} title={t('Installed version')}>
        {version}
      </OverviewDetailItem>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={!loaded} title={t('Update status')}>
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
            {loaded ? (
              <ExternalLink href={operatorLink}>{updateChannel}</ExternalLink>
            ) : (
              <Skeleton />
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      <Divider className="general-tab__divider" />
      <OverviewDetailItem isLoading={loading} title={t('Preview features')}>
        <Checkbox
          className="general-tab__checkbox"
          id="tp-instance-type"
          isChecked={isChecked}
          onClick={(event) => {
            toggleInstanceTypesFeature(event.currentTarget.checked);
            setIsChecked(event.currentTarget.checked);
          }}
          label={t('Enable creating a VirtualMachine from an InstanceType')}
          isDisabled={!canEdit}
        />
      </OverviewDetailItem>
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
    </>
  );
};

export default GeneralTab;
