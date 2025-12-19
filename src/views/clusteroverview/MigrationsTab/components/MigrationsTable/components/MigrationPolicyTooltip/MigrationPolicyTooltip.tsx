import React, { useMemo } from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Tooltip } from '@patternfly/react-core';

import { MigrationTableDataLayout } from '../../utils/utils';

import { migrationsConfigTooltipFields } from './utils';

type TooltipFieldObject = { label: string; value: string };

type TooltipObject = { defaultConfig: TooltipFieldObject[]; mpConfig: TooltipFieldObject[] };

type MigrationPolicyTooltipProps = {
  obj: MigrationTableDataLayout;
};

const MigrationPolicyTooltip: React.FC<MigrationPolicyTooltipProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  const { defaultConfig, mpConfig } = useMemo<TooltipObject>(() => {
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
        defaultConfig: [],
        mpConfig: [],
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
        <MulticlusterResourceLink
          cluster={getCluster(obj?.vmiObj)}
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
