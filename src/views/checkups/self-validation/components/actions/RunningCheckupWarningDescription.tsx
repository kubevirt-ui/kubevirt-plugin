import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import './running-checkup-warning-description.scss';

type RunningCheckupWarningDescriptionProps = {
  configMapCluster: string;
  configMapName: string;
  configMapNamespace: string;
  maxWidth?: string;
  preventLink?: boolean;
  showTitle?: boolean;
};

const RunningCheckupWarningDescription: FC<RunningCheckupWarningDescriptionProps> = ({
  configMapCluster,
  configMapName,
  configMapNamespace,
  maxWidth = '50px',
  preventLink = false,
  showTitle = true,
}) => {
  const { t } = useKubevirtTranslation();
  const linkTo = getSelfValidationCheckupURL(configMapName, configMapNamespace, configMapCluster);

  return (
    <span className="running-checkup-warning">
      {showTitle && <span>{t('Self validation already running')}</span>}
      <Link
        onClick={(e) => {
          !preventLink && e.stopPropagation();
        }}
        className="running-checkup-warning__link co-resource-item__resource-name"
        to={preventLink ? null : linkTo}
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
