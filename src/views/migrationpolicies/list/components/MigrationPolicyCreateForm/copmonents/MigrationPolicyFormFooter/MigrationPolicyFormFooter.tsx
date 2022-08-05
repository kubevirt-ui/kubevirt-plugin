import React from 'react';
import { useHistory } from 'react-router-dom';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
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

import { migrationPoliciesPageBaseURL } from '../../../../utils/constants';

type MigrationPolicyFormFooterProps = {
  migrationPolicy: V1alpha1MigrationPolicy;
};

const MigrationPolicyFormFooter: React.FC<MigrationPolicyFormFooterProps> = ({
  migrationPolicy,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const migrationPolicyName = migrationPolicy?.metadata?.name;

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    k8sCreate({ model: MigrationPolicyModel, data: migrationPolicy })
      .then(() => history.push(`${migrationPoliciesPageBaseURL}/${migrationPolicyName}`))
      .catch(setError)
      .finally(() => setIsSubmitting(false));
  };

  const closeModal = () => {
    setError(undefined);
    setIsSubmitting(false);
    history.goBack();
  };
  return (
    <Stack className="kv-tabmodal-footer" hasGutter>
      {error && (
        <StackItem>
          <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
            <Stack hasGutter>
              <StackItem>{error?.message}</StackItem>
              {error?.href && (
                <StackItem>
                  <a href={error.href} target="_blank" rel="noreferrer">
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
              onClick={handleSubmit}
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
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
