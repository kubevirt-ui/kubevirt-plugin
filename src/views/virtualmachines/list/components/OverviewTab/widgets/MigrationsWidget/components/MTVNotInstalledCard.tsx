import React, { FC } from 'react';
import { Link } from 'react-router';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Icon } from '@patternfly/react-core';

import './MTVNotInstalledCard.scss';

const MTVNotInstalledCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [activeNamespace] = useActiveNamespace();
  const validNamespace = getValidNamespace(activeNamespace);

  return (
    <Card className="mtv-not-installed-card" data-test="mtv-not-installed-card" isCompact>
      <CardHeader>
        <CardTitle className="mtv-not-installed-card__title">
          <Icon size="md">
            <BlueInfoCircleIcon />
          </Icon>
          {t('Migration Toolkit not installed')}
        </CardTitle>
      </CardHeader>
      <CardBody>
        {t(
          'To enable migrations and view status metrics, install the Migration Toolkit for Virtualization (MTV) Operator.',
        )}
      </CardBody>
      <CardFooter className="mtv-not-installed-card__footer">
        {isAdmin ? (
          <>
            <Link to={`/catalog/ns/${validNamespace}?keyword=MTV`}>
              {t('Install MTV operator')}
            </Link>
            <ExternalLink href={documentationURL.MTV_OPERATOR} text={t('View documentation')} />
          </>
        ) : (
          <ExternalLink
            href={documentationURL.MTV_OPERATOR}
            text={t('View installation documentation')}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default MTVNotInstalledCard;
