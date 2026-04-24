import React, { FC } from 'react';
import { Link } from 'react-router';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CardHeaderActionsObject } from '@patternfly/react-core';

type UpdateAvailableActionProps = {
  isSpokeCluster: boolean;
  operatorLink: string;
  operatorLinkExternal?: string;
  updateAvailable: boolean;
};

const UpdateAvailableAction: FC<UpdateAvailableActionProps> = ({
  isSpokeCluster,
  operatorLink,
  operatorLinkExternal,
  updateAvailable,
}) => {
  const { t } = useKubevirtTranslation();

  if (!updateAvailable || (!operatorLink && !operatorLinkExternal)) {
    return null;
  }

  if (isSpokeCluster && operatorLinkExternal) {
    return (
      <ExternalLink
        className="openshift-virtualization-widget__update-available"
        dataTestID="openshift-virtualization-widget-update-available"
        href={operatorLinkExternal}
        text={t('Update available')}
      />
    );
  }

  return (
    <Link
      className="openshift-virtualization-widget__update-available"
      data-test="openshift-virtualization-widget-update-available"
      to={operatorLink}
    >
      {t('Update available')}
    </Link>
  );
};

export const getUpdateAvailableActions = (
  props: UpdateAvailableActionProps,
): CardHeaderActionsObject | undefined => {
  const { operatorLink, operatorLinkExternal, updateAvailable } = props;
  if (!updateAvailable || (!operatorLink && !operatorLinkExternal)) {
    return undefined;
  }

  return {
    actions: <UpdateAvailableAction {...props} />,
    hasNoOffset: false,
  };
};
