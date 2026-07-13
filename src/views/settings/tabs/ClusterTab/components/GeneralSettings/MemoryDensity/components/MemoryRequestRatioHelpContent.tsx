import React, { FC } from 'react';

import { Trans } from 'react-i18next';

import PopoverSectionExpandable from '@kubevirt-utils/components/PopoverSectionExpandable/PopoverSectionExpandable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, Stack, StackItem } from '@patternfly/react-core';

import { getRatioLevelConfig } from '../utils/utils';

import '../memory-density.scss';

const MemoryRequestRatioHelpContent: FC = () => {
  const { t } = useKubevirtTranslation();

  const ratioLevelConfig = getRatioLevelConfig(t);

  return (
    <Content>
      <p className="pf-v6-u-mb-sm">
        <strong>{t('Memory request ratio')}</strong>
      </p>
      <p className="pf-v6-u-mb-sm">
        {t("The percentage of each VM's configured memory that is requested on the cluster.")}
      </p>
      <p>
        <Trans ns="plugin__kubevirt-plugin">
          For example: At <strong>25%</strong> ratio, a VM with a memory configuration of 4 GiB will
          request 1 GiB on the cluster. At <strong>100%</strong>, it requests the configured amount
          of 4 GiB.
        </Trans>
      </p>
      <div className="pf-v6-u-mt-sm">
        <PopoverSectionExpandable toggleText={t('Ratio levels')}>
          <Stack className="pf-v6-u-mt-xs" hasGutter>
            {Object.values(ratioLevelConfig).map(({ color, description, title }) => (
              <StackItem key={title}>
                <div className="memory-density__ratio-level-row">
                  <span
                    className="memory-density__ratio-level-dot"
                    style={{ backgroundColor: color }}
                  />
                  <Stack>
                    <StackItem>
                      <strong>{title}</strong>
                    </StackItem>
                    <StackItem>{description}</StackItem>
                  </Stack>
                </div>
              </StackItem>
            ))}
          </Stack>
        </PopoverSectionExpandable>
      </div>
    </Content>
  );
};

export default MemoryRequestRatioHelpContent;
