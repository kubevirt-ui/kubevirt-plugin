import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { SCOPE } from '../constants';
import { ScopeType, VirtualizationQuota } from '../types';

type QuotaCreateFormScopeProps = {
  namespace: string;
  onQuotaChange: (quota: VirtualizationQuota) => void;
  quota: VirtualizationQuota;
};

const QuotaCreateFormScope: FC<QuotaCreateFormScopeProps> = ({
  namespace,
  onQuotaChange,
  quota,
}) => {
  const { t } = useKubevirtTranslation();

  const scope = quota.scope;

  const setScope = (newScope: ScopeType) => {
    onQuotaChange({ ...quota, scope: newScope });
  };

  return (
    <FormGroup
      fieldId="scope-type-group"
      isRequired
      isStack
      label={t('Scope type')}
      role="radiogroup"
    >
      <Radio
        description={t(
          'Create virtualization quota at the cluster level for all or some of the projects.',
        )}
        id="quota-scope-cluster"
        isChecked={scope === SCOPE.cluster}
        label={t('Cluster scoped')}
        name="scope-type"
        onChange={() => setScope(SCOPE.cluster)}
      />
      <Radio
        description={t('Create virtualization quota in project: {{namespace}}', { namespace })}
        id="quota-scope-project"
        isChecked={scope === SCOPE.project}
        label={t('Project scoped')}
        name="scope-type"
        onChange={() => setScope(SCOPE.project)}
      />
    </FormGroup>
  );
};

export default QuotaCreateFormScope;
