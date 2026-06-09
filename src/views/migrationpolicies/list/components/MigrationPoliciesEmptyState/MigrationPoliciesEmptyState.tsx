import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { MigrationIcon } from '@patternfly/react-icons';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

const MigrationPoliciesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')} />
      <ListPageBody>
        <ListEmptyState
          learnMoreLink={
            <ExternalLink
              href={documentationURL.MIGRATION_POLICIES}
              text={t('Learn more about MigrationPolicies')}
            />
          }
          bodyContent={t('To get started, create a MigrationPolicy.')}
          buttonAction={<MigrationPoliciesCreateButton />}
          icon={MigrationIcon}
          titleText={t("You don't have any MigrationPolicies yet")}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesEmptyState;
