import * as React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import MigrationPolicyBreadcrumb from '../MigrationPolicyBreadcrumb/MigrationPolicyBreadcrumb';

import './MigrationPolicyDetailsNavTitle.scss';

type MigrationPolicyDetailsNavTitleProps = {
  mp: V1alpha1MigrationPolicy;
};

const MigrationPolicyDetailsNavTitle: React.FC<MigrationPolicyDetailsNavTitleProps> = ({ mp }) => {
  const { t } = useKubevirtTranslation();
  return (
    <DetailsPageTitle breadcrumb={<MigrationPolicyBreadcrumb />}>
      <PaneHeading>
        <Title headingLevel="h1">
          <span className="kv-resource-icon">{t('MP')}</span>
          {mp?.metadata?.name}
        </Title>
        <MigrationPoliciesActions mp={mp} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default MigrationPolicyDetailsNavTitle;
