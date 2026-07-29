import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateLink } from '@openshift-console/dynamic-plugin-sdk';
import { SearchIcon } from '@patternfly/react-icons';
import { getCreateComputeResourceURL } from '../utils/utils';

type UserProvidedComputeResourcesEmptyStateProps = {
  namespace: string;
};

const UserProvidedComputeResourcesEmptyState: FC<UserProvidedComputeResourcesEmptyStateProps> = ({
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListEmptyState
      buttonAction={
        <ListPageCreateLink
          createAccessReview={{ groupVersionKind: VirtualMachineInstancetypeModelRef, namespace }}
          to={getCreateComputeResourceURL(namespace)}
        >
          {t('Create compute resource')}
        </ListPageCreateLink>
      }
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          To get started, create a <b>compute resource</b>.
        </Trans>
      }
      titleText={t("You don't have any compute resources yet")}
      icon={SearchIcon}
      learnMoreLink={
        <ExternalLink
          href={documentationURL.INSTANCE_TYPES_USER_GUIDE}
          text={t('Learn more about compute resources')}
        />
      }
    />
  );
};

export default UserProvidedComputeResourcesEmptyState;
