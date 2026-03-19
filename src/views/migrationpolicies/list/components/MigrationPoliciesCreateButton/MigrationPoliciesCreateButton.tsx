import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getMigrationPolicyURL } from 'src/views/migrationpolicies/utils/utils';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { K8sVerb, ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Tooltip } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const selectedCluster = useSelectedCluster();
  const navigate = useNavigate();

  const createItems = {
    form: t('From Form'),
    yaml: t('With YAML'),
  };

  const [canCreateMigrationPolicy] = useFleetAccessReview({
    cluster: selectedCluster,
    group: MigrationPolicyModel.apiGroup,
    resource: MigrationPolicyModel.plural,
    verb: 'create' as K8sVerb,
  });

  const onCreate = (type: string) => {
    return navigate(getMigrationPolicyURL(type === 'form' ? 'form' : '~new', selectedCluster));
  };

  if (!canCreateMigrationPolicy) {
    return (
      <Tooltip
        content={t(
          'To perform this action you must get permission from your Organization Administrator.',
        )}
      >
        <Button isAriaDisabled>{t('Create MigrationPolicy')}</Button>
      </Tooltip>
    );
  }

  return (
    <ListPageCreateDropdown
      createAccessReview={{ groupVersionKind: MigrationPolicyModelGroupVersionKind }}
      items={createItems}
      onClick={onCreate}
    >
      {t('Create MigrationPolicy')}
    </ListPageCreateDropdown>
  );
};

export default MigrationPoliciesCreateButton;
