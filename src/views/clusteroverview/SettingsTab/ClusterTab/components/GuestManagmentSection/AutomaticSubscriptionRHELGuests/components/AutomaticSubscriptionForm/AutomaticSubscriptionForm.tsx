import React, { FC, useEffect, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionFormProps } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { debounce } from '@kubevirt-utils/utils/debounce';
import {
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

const AutomaticSubscriptionForm: FC<RHELAutomaticSubscriptionFormProps> = ({
  canEdit,
  loaded,
  subscriptionData,
  updateSubscription,
}) => {
  const { t } = useKubevirtTranslation();

  const [activationKey, setActivationKey] = useState<string>(null);
  const [organizationID, setOrganizationID] = useState<string>(null);

  useEffect(() => {
    if (activationKey === null && organizationID === null && loaded) {
      setActivationKey(subscriptionData?.activationKey);
      setOrganizationID(subscriptionData?.organizationID);
    }
  }, [activationKey, loaded, organizationID, subscriptionData]);

  const update = useMemo(
    () =>
      debounce((val) => {
        updateSubscription(val);
      }, 400),
    [updateSubscription],
  );

  if (!loaded) return <Skeleton />;

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
              <TextInput
                onChange={(_event, val) => {
                  setActivationKey(val);
                  update({ activationKey: val });
                }}
                isDisabled={!canEdit}
                value={activationKey}
              />
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
              <TextInput
                onChange={(_event, val) => {
                  setOrganizationID(val);
                  update({ organizationID: val });
                }}
                isDisabled={!canEdit}
                value={organizationID}
              />
            </GridItem>
          </Grid>
        </FormGroup>
      </Form>
    </>
  );
};

export default AutomaticSubscriptionForm;
