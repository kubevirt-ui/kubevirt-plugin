import React, { type FC } from 'react';
import { useNavigate } from 'react-router';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { FAMILY_AVAILABILITY_SECTION_ID } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/constants';
import { getAllInstanceTypeFamiliesDisabledMessage } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FLEET_INSTANCETYPES_PATH } from '@multicluster/constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type RedHatInstanceTypesEmptyStateProps = {
  allFamiliesDisabled: boolean;
  canEdit: boolean;
  cluster?: string;
};

const getFamilyAvailabilityPath = (cluster: string | undefined, isACMPage: boolean): string => {
  const hash = `#${FAMILY_AVAILABILITY_SECTION_ID}`;
  if (isACMPage) {
    const clusterPath = cluster ? `/cluster/${cluster}` : '/all-clusters';
    return `${FLEET_INSTANCETYPES_PATH}${clusterPath}${hash}`;
  }
  return `/k8s/cluster/${VirtualMachineClusterInstancetypeModelRef}${hash}`;
};

const RedHatInstanceTypesEmptyState: FC<RedHatInstanceTypesEmptyStateProps> = ({
  allFamiliesDisabled,
  canEdit,
  cluster,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();
  const familyAvailabilityPath = getFamilyAvailabilityPath(cluster, isACMPage);
  const showManageFamiliesCta = allFamiliesDisabled && canEdit;

  const bodyContent = allFamiliesDisabled
    ? getAllInstanceTypeFamiliesDisabledMessage(t, canEdit)
    : t('No Red Hat provided compute resources are available.');

  return (
    <EmptyState
      data-test="empty-state"
      headingLevel="h2"
      icon={SearchIcon}
      titleText={t('No compute resources available')}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>{bodyContent}</EmptyStateBody>
      <EmptyStateFooter>
        {showManageFamiliesCta && (
          <EmptyStateActions>
            <Button
              data-test="manage-family-availability"
              onClick={() => navigate(familyAvailabilityPath)}
              variant={ButtonVariant.primary}
            >
              {t('Manage family availability')}
            </Button>
          </EmptyStateActions>
        )}
        <EmptyStateActions>
          <ExternalLink
            href={documentationURL.INSTANCE_TYPES_USER_GUIDE}
            text={t('Learn more about compute resources')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default RedHatInstanceTypesEmptyState;
