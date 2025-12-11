import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { CHECKUP_URLS } from 'src/views/checkups/utils/constants';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import './running-checkup-warning-description.scss';

type RunningCheckupWarningDescriptionProps = {
  configMapName: string;
  configMapNamespace: string;
  maxWidth?: string;
  showTitle?: boolean;
};

const RunningCheckupWarningDescription: FC<RunningCheckupWarningDescriptionProps> = ({
  configMapName,
  configMapNamespace,
  maxWidth = '50px',
  showTitle = true,
}) => {
  const linkTo = createURL(
    `${CHECKUP_URLS.SELF_VALIDATION}/${configMapName}`,
    `/k8s/ns/${configMapNamespace}/checkups`,
  );

  return (
    <span className="running-checkup-warning">
      {showTitle && <span>{t('Self validation already running')}</span>}
      <Link
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="running-checkup-warning__link co-resource-item__resource-name"
        to={linkTo}
      >
        <span className="running-checkup-warning__name" style={{ maxWidth: maxWidth }}>
          {configMapName}
        </span>
        <ExternalLinkAltIcon className="running-checkup-warning__icon" />
      </Link>
    </span>
  );
};

export default RunningCheckupWarningDescription;
