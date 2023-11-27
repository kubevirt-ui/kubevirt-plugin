import React, { FC, useEffect, useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ActionGroup,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Skeleton,
  TextInput,
} from '@patternfly/react-core';

import { ACTIVATION_KEYS_URL } from '../../utils/constants';
import ActivationKeyHelpIcon from '../ActivationKeyHelpIcon/ActivationKeyHelpIcon';
import OrganizationIDHelpIcon from '../OrganizationIDHelpIcon/OrganizationIDHelpIcon';

import './AutomaticSubscriptionForm.scss';

const AutomaticSubscriptionForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const { canEdit, loaded, loading, subscriptionData, updateSubscription } =
    useRHELAutomaticSubscription();

  const [activationKey, setActivationKey] = useState<string>(null);
  const [organizationID, setOrganizationID] = useState<string>(null);

  useEffect(() => {
    if (activationKey === null && organizationID === null && loaded) {
      setActivationKey(subscriptionData?.activationKey);
      setOrganizationID(subscriptionData?.organizationID);
    }
  }, [activationKey, loaded, organizationID, subscriptionData]);

  if (!loaded) return <Skeleton />;

  const isDisabled =
    !canEdit ||
    isEqualObject(subscriptionData, { activationKey, organizationID }) ||
    (!isEmpty(organizationID) && isEmpty(activationKey)) ||
    (isEmpty(organizationID) && !isEmpty(activationKey));

  const handleSubmit = () => {
    !isDisabled && updateSubscription(activationKey, organizationID);
  };

  return (
    <>
      <Form className="pf-u-mt-sm" isHorizontal isWidthLimited>
        <FormGroup
          className="subscription-label"
          label={t('Activation key')}
          labelIcon={<ActivationKeyHelpIcon />}
        >
          <Grid hasGutter>
            <GridItem span={7}>
              <TextInput onChange={setActivationKey} value={activationKey} />
            </GridItem>
            <GridItem span={5}>
              <Button
                component="a"
                href={ACTIVATION_KEYS_URL}
                target="_blank"
                variant={ButtonVariant.link}
              >
                {t('Create activation key')}
              </Button>
            </GridItem>
          </Grid>
        </FormGroup>
        <FormGroup
          className="subscription-label"
          label={t('Organization ID')}
          labelIcon={<OrganizationIDHelpIcon />}
        >
          <Grid hasGutter>
            <GridItem span={7}>
              <TextInput onChange={setOrganizationID} value={organizationID} />
            </GridItem>
          </Grid>
        </FormGroup>
      </Form>
      <ActionGroup className="pf-u-mt-md">
        <Button
          isDisabled={isDisabled}
          isLoading={loading}
          onClick={handleSubmit}
          variant={ButtonVariant.primary}
        >
          {t('Apply')}
        </Button>
      </ActionGroup>
    </>
  );
};

export default AutomaticSubscriptionForm;
