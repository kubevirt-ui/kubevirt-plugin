import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useMigrationPoliciesPageBaseURL } from 'src/views/migrationpolicies/hooks/useMigrationPoliciesPageBaseURL';

import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type MigrationPolicyFormFooterProps = {
  migrationPolicy: V1alpha1MigrationPolicy;
};

const MigrationPolicyFormFooter: React.FC<MigrationPolicyFormFooterProps> = ({
  migrationPolicy,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const cluster = useClusterParam();

  const migrationPoliciesBaseURL = useMigrationPoliciesPageBaseURL();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const migrationPolicyName = migrationPolicy?.metadata?.name;

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    kubevirtK8sCreate({ cluster, data: migrationPolicy, model: MigrationPolicyModel })
      .then(() => navigate(`${migrationPoliciesBaseURL}/${migrationPolicyName}`))
      .catch(setError)
      .finally(() => setIsSubmitting(false));
  };

  const closeModal = () => {
    setError(undefined);
    setIsSubmitting(false);
    navigate(-1);
  };

  return (
    <Stack className="kv-tabmodal-footer" hasGutter>
      {error && (
        <StackItem>
          <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
            <Stack hasGutter>
              <StackItem>{error?.message}</StackItem>
              {error?.href && (
                <StackItem>
                  <a href={error.href} rel="noreferrer" target="_blank">
                    {error.href}
                  </a>
                </StackItem>
              )}
            </Stack>
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <ActionList>
          <ActionListItem>
            <Button
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={handleSubmit}
              variant={ButtonVariant.primary}
            >
              {t('Create')}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button onClick={closeModal} variant={ButtonVariant.link}>
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionList>
      </StackItem>
    </Stack>
  );
};

export default MigrationPolicyFormFooter;
