import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, NumberInput, Text, TextInput, Title } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../utils/constants';

type SchedulingSettingsProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const SchedulingSettings: FC<SchedulingSettingsProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const { cronExpression, retainRevisions } = bootableVolume || {};

  return (
    <>
      <FormGroup
        helperText={t(
          'Specify the number of revisions that should be retained. A value of X means that the X latest versions will be kept.',
        )}
        fieldId="volume-registry-retain-revisions"
        isRequired
        label={t('Retain revisions')}
      >
        <NumberInput
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setBootableVolumeField('retainRevisions')(event.currentTarget.valueAsNumber)
          }
          id="volume-registry-retain-revisions"
          min={0}
          minusBtnAriaLabel={t('Decrement')}
          onMinus={() => setBootableVolumeField('retainRevisions')(retainRevisions - 1)}
          onPlus={() => setBootableVolumeField('retainRevisions')(retainRevisions + 1)}
          plusBtnAriaLabel={t('Increment')}
          value={retainRevisions}
        />
      </FormGroup>

      <div>
        <Title headingLevel="h2" size="md">
          {t('Scheduling settings')}
        </Title>
        <Text>
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            {t('Use cron formatting to set when and how often to look for new imports.')}{' '}
            <ExternalLink
              href={'https://www.redhat.com/sysadmin/automate-linux-tasks-cron'}
              text={t('Learn more')}
            />
          </Trans>
        </Text>
      </div>
      <FormGroup
        fieldId="volume-registry-retain-cron-expression"
        helperText={t('Example (At 00:00 on Tuesday): 0 0 * * 2.')}
        isRequired
        label={t('Cron expression')}
      >
        <TextInput
          data-test-id="volume-registry-retain-cron-expression"
          id="volume-registry-retain-cron-expression"
          onChange={setBootableVolumeField('cronExpression')}
          type="text"
          value={cronExpression}
        />
      </FormGroup>
    </>
  );
};

export default SchedulingSettings;
