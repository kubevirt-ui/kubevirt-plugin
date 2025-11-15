import React, { FC, useRef } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { KUBE_DESCHEDULER_URL } from '@kubevirt-utils/resources/descheduler/constants';
import useKubeDescheduler from '@kubevirt-utils/resources/descheduler/hooks/useKubeDescheduler';
import { getDeviationThreshold } from '@kubevirt-utils/resources/descheduler/selectors';
import {
  DeschedulerProfile,
  DeviationThreshold,
} from '@kubevirt-utils/resources/descheduler/types';
import { updateDeviationThreshold } from '@kubevirt-utils/resources/descheduler/utils';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Flex, Stack, StackItem, Tooltip } from '@patternfly/react-core';
import { SimpleSelect } from '@patternfly/react-templates';

import { deviationThresholdOptions } from '../constants';

import DeschedulerThresholdHelp from './DeschedulerThresholdHelp';

import './DeschedulerSection.scss';

const DeschedulerSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { descheduler, deschedulerLoaded } = useKubeDescheduler();

  const selectedLevel = getDeviationThreshold(descheduler);

  const handleDeviationThresholdChange = (_event, selectedThreshold: DeviationThreshold) => {
    updateDeviationThreshold(descheduler, selectedThreshold).catch((err) =>
      kubevirtConsole.error(err),
    );
  };

  const isCreated = deschedulerLoaded && !isEmpty(descheduler);
  const hasKubeVirtProfile = [
    DeschedulerProfile.KubeVirtRelieveAndMigrate,
    DeschedulerProfile.DevKubeVirtRelieveAndMigrate,
  ].some((profile) => descheduler?.spec?.profiles?.includes(profile));

  const tooltipRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="descheduler-section">
      <Stack hasGutter>
        <StackItem>
          <Flex>
            <h3 className="descheduler-section__header">
              {isCreated ? (
                <Link to={KUBE_DESCHEDULER_URL}>{t('Kube Descheduler')}</Link>
              ) : (
                t('Kube Descheduler')
              )}
            </h3>
          </Flex>
        </StackItem>
        <StackItem>
          {t(
            'The Kube Descheduler Operator provides the ability to evict a running Pod so that the Pod can be rescheduled onto a more suitable Node.',
          )}
        </StackItem>
        <StackItem>{t('You can set a target balance level to guide the process.')}</StackItem>
        <StackItem>
          <span ref={tooltipRef}>
            <SimpleSelect
              initialOptions={deviationThresholdOptions.map((threshold) => ({
                content: threshold.value,
                description: threshold.description,
                selected: threshold.value === selectedLevel,
                value: threshold.value,
              }))}
              isDisabled={!isCreated || !hasKubeVirtProfile}
              onSelect={handleDeviationThresholdChange}
              placeholder={t('Select threshold')}
            />
          </span>
          {(!isCreated || !hasKubeVirtProfile) && (
            <Tooltip
              content={
                !isCreated
                  ? t(
                      'Create a Kube Descheduler with KubeVirtRelieveAndMigrate profile to use this feature.',
                    )
                  : t(
                      'Use KubeVirtRelieveAndMigrate profile in the Kube Descheduler to use this feature.',
                    )
              }
              triggerRef={tooltipRef}
            />
          )}
          <DeschedulerThresholdHelp />
        </StackItem>
      </Stack>
    </div>
  );
};

export default DeschedulerSection;
