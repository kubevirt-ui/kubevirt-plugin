import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

type RunningCheckupWarningDescriptionProps = {
  configMapName: string;
  configMapNamespace: string;
};

const RunningCheckupWarningDescription: FC<RunningCheckupWarningDescriptionProps> = ({
  configMapName,
  configMapNamespace,
}) => (
  <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.25rem', maxWidth: '100%' }}>
    <span>{t('Self validation already running')}</span>{' '}
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        gap: '0.25rem',
        textDecoration: 'none',
      }}
      className="co-resource-item__resource-name"
      to={createURL(`self-validation/${configMapName}`, `/k8s/ns/${configMapNamespace}/checkups`)}
    >
      <span
        style={{
          maxWidth: '50px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {configMapName}
      </span>
      <ExternalLinkAltIcon style={{ flexShrink: 0 }} />
    </Link>
  </span>
);

export default RunningCheckupWarningDescription;
