import React, { useMemo } from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';

import { MigrationTableDataLayout } from '../../utils/utils';

import { migrationsConfigTooltipFields } from './utils';

type TooltipFieldObject = { label: string; value: string };

type TooltipObject = { mpConfig: TooltipFieldObject[]; defaultConfig: TooltipFieldObject[] };

type MigrationPolicyTooltipProps = {
  obj: MigrationTableDataLayout;
};

const MigrationPolicyTooltip: React.FC<MigrationPolicyTooltipProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  const { mpConfig, defaultConfig } = useMemo<TooltipObject>(() => {
    const mpSpec = obj?.mpObj?.spec;
    const defaultConfigurations = obj?.migrationsDefaultConfigurations;
    return migrationsConfigTooltipFields.reduce(
      (acc, { field, getDisplayText, label }) => {
        if (mpSpec?.[field] !== undefined) {
          return {
            ...acc,
            mpConfig: [...acc.mpConfig, { label, value: getDisplayText(mpSpec?.[field]) }],
          };
        }

        if (defaultConfigurations?.[field] !== undefined) {
          return {
            ...acc,
            defaultConfig: [
              ...acc.defaultConfig,
              { label, value: getDisplayText(defaultConfigurations?.[field]) },
            ],
          };
        }

        return acc;
      },
      {
        mpConfig: [],
        defaultConfig: [],
      },
    );
  }, [obj]);

  return (
    <Tooltip
      content={
        <>
          {!isEmpty(mpConfig) && (
            <>
              <div>
                <b>{t('MigrationPolicy values')}</b>
              </div>
              {mpConfig.map(({ label, value }) => (
                <div key={value}>
                  {label}: {value}
                </div>
              ))}
            </>
          )}
          {!isEmpty(defaultConfig) && (
            <>
              <div>
                <b>{t('Default values')}</b>
              </div>
              {defaultConfig.map(({ label, value }) => (
                <div key={value}>
                  {label}: {value}
                </div>
              ))}
            </>
          )}
        </>
      }
    >
      {obj?.vmiObj?.status?.migrationState?.migrationPolicyName ? (
        <ResourceLink
          groupVersionKind={MigrationPolicyModelGroupVersionKind}
          name={obj?.vmiObj?.status?.migrationState?.migrationPolicyName}
        />
      ) : (
        <MutedTextSpan text={t('No MigrationPolicy')} />
      )}
    </Tooltip>
  );
};

export default MigrationPolicyTooltip;
