import type { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DocumentTitle, ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { MigrationIcon } from '@patternfly/react-icons';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

type MigrationPoliciesEmptyStateProps = {
  pageTitle: string;
};

const MigrationPoliciesEmptyState: FC<MigrationPoliciesEmptyStateProps> = ({ pageTitle }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <DocumentTitle>{pageTitle}</DocumentTitle>
      <ListPageHeader title={pageTitle} />
      <ListPageBody>
        <ListEmptyState
          bodyContent={t('To get started, create a MigrationPolicy.')}
          buttonAction={<MigrationPoliciesCreateButton />}
          icon={MigrationIcon}
          learnMoreLink={
            <ExternalLink
              href={documentationURL.MIGRATION_POLICIES}
              text={t('Learn more about MigrationPolicies')}
            />
          }
          titleText={t("You don't have any MigrationPolicies yet")}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesEmptyState;
