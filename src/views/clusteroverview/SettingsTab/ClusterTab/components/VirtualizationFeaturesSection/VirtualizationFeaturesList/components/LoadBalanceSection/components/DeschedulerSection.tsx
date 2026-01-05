import React, { FC, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { KUBE_DESCHEDULER_URL } from '@kubevirt-utils/resources/descheduler/constants';
import useKubeDescheduler from '@kubevirt-utils/resources/descheduler/hooks/useKubeDescheduler';
import {
  DeschedulerProfile,
  DeviationThreshold,
} from '@kubevirt-utils/resources/descheduler/types';
import { updateDeviationThreshold } from '@kubevirt-utils/resources/descheduler/utils';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Flex, Stack, StackItem, Tooltip } from '@patternfly/react-core';
import { SimpleSelect } from '@patternfly/react-templates';

import { useDeviationThresholdSelectOptions } from '../hooks/useDeviationThresholdSelectOptions';

import DeschedulerThresholdHelp from './DeschedulerThresholdHelp';

import './DeschedulerSection.scss';

type DeschedulerSectionProps = {
  isOperatorInstalled: boolean;
};

const DeschedulerSection: FC<DeschedulerSectionProps> = ({ isOperatorInstalled }) => {
  const { t } = useKubevirtTranslation();
  const { descheduler, deschedulerLoaded } = useKubeDescheduler();

  const deviationThresholdSelectOptions = useDeviationThresholdSelectOptions(descheduler);

  const handleDeviationThresholdChange = (_event, selectedThreshold: DeviationThreshold) => {
    updateDeviationThreshold(descheduler, selectedThreshold).catch((err) =>
      kubevirtConsole.error(err),
    );
  };

  const hasDescheduler = deschedulerLoaded && !isEmpty(descheduler);
  const hasKubeVirtProfile = [
    DeschedulerProfile.KubeVirtRelieveAndMigrate,
    DeschedulerProfile.DevKubeVirtRelieveAndMigrate,
  ].some((profile) => descheduler?.spec?.profiles?.includes(profile));

  const isSelectDisabled = !isOperatorInstalled || !hasDescheduler || !hasKubeVirtProfile;

  const tooltipContent = useMemo(() => {
    if (!isOperatorInstalled) return t('Install load balance feature first to select a threshold.');
    if (!hasDescheduler)
      return t(
        'Create a Kube Descheduler with KubeVirtRelieveAndMigrate profile to use this feature.',
      );
    return t('Use KubeVirtRelieveAndMigrate profile in the Kube Descheduler to use this feature.');
  }, [isOperatorInstalled, hasDescheduler, t]);

  const tooltipRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="descheduler-section">
      <Stack hasGutter>
        <StackItem>
          <Flex>
            <h3 className="descheduler-section__header">
              {hasDescheduler ? (
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
              initialOptions={deviationThresholdSelectOptions}
              isDisabled={isSelectDisabled}
              onSelect={handleDeviationThresholdChange}
              placeholder={t('Select threshold')}
            />
          </span>
          {isSelectDisabled && <Tooltip content={tooltipContent} triggerRef={tooltipRef} />}
          <DeschedulerThresholdHelp />
        </StackItem>
      </Stack>
    </div>
  );
};

export default DeschedulerSection;
