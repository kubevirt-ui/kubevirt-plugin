import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Label,
  Tooltip,
} from '@patternfly/react-core';

import type { ObservabilityDisabledAlertProps } from './utils';
import { CLUSTER_SEPARATOR } from './utils';

import './ObservabilityDisabledAlert.scss';

const ObservabilityDisabledAlert: FC<ObservabilityDisabledAlertProps> = ({ disabledClusters }) => {
  const { t } = useKubevirtTranslation();
  const [alertDismissed, setAlertDismissed] = useState(false);
  const disabledClustersKey = useMemo(
    () => disabledClusters.join(CLUSTER_SEPARATOR),
    [disabledClusters],
  );

  useEffect(() => {
    // Reset the alert dismissed state when the disabled clusters change
    setAlertDismissed(false);
  }, [disabledClustersKey]);

  if (alertDismissed || disabledClusters.length === 0) {
    return null;
  }

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={() => setAlertDismissed(true)} />}
      className={classNames('observability-disabled-alert', {
        'observability-disabled-alert--multiple': disabledClusters.length > 1,
      })}
      isInline
      title={null}
      variant={AlertVariant.warning}
    >
      {disabledClusters.length === 1 ? (
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          The RHACM Observability Operator is currently disabled on this cluster and is preventing
          this view from showing <b>[{disabledClusters[0]}]</b> data.
        </Trans>
      ) : (
        <>
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            The RHACM Observability Operator is currently disabled on <b>[{disabledClusters[0]}]</b>
          </Trans>
          {' + '}
          <Tooltip
            content={
              <div>
                {disabledClusters.slice(1).map((clusterName) => (
                  <div key={clusterName}>{clusterName}</div>
                ))}
              </div>
            }
          >
            <Label variant="outline">
              {t('{{num}} more', { num: disabledClusters.length - 1 })}
            </Label>
          </Tooltip>{' '}
          {t('and is preventing this view from showing their data.')}
        </>
      )}
      <ExternalLink className="observability-disabled-alert__link" href={documentationURL.RHACM}>
        {t('Learn more about RHACM.')}
      </ExternalLink>
    </Alert>
  );
};

export default ObservabilityDisabledAlert;
