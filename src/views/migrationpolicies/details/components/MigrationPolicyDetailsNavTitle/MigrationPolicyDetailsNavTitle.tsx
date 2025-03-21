import * as React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import MigrationPolicyBreadcrumb from '../MigrationPolicyBreadcrumb/MigrationPolicyBreadcrumb';

import './MigrationPolicyDetailsNavTitle.scss';

type VirtualMachineNavPageTitleProps = {
  mp: V1alpha1MigrationPolicy;
};

const VirtualMachineNavPageTitle: React.FC<VirtualMachineNavPageTitleProps> = ({ mp }) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="kv-resource-details-header-container">
      <MigrationPolicyBreadcrumb />
      <span className="kv-resource-details-header">
        <Title headingLevel="h1">
          <span className="kv-resource-icon">{t('MP')}</span>
          {mp?.metadata?.name}
        </Title>
        <MigrationPoliciesActions mp={mp} />
      </span>
    </div>
  );
};

export default VirtualMachineNavPageTitle;
