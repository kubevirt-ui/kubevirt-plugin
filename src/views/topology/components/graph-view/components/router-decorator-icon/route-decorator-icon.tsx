import React from 'react';
import { TFunction } from 'i18next';

import { BitbucketIcon, GitAltIcon, GithubIcon, GitlabIcon } from '@patternfly/react-icons';

import CheIcon from './components/CheIcon';
import { GitProvider } from './types/types';
import { detectGitType } from './utils/utils';

export const routeDecoratorIcon = (
  routeURL: string,
  radius: number,
  t: TFunction,
  cheEnabled?: boolean,
  cheIconURL?: string,
): React.ReactElement => {
  if (cheEnabled && routeURL) {
    return cheIconURL ? (
      <image xlinkHref={cheIconURL} width={radius} height={radius} />
    ) : (
      <CheIcon style={{ fontSize: radius }} />
    );
  }
  switch (detectGitType(routeURL)) {
    case GitProvider.INVALID:
      // Not a valid url and thus not safe to use
      return null;
    case GitProvider.GITHUB:
      return <GithubIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
    case GitProvider.BITBUCKET:
      return (
        <BitbucketIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />
      );
    case GitProvider.GITLAB:
      return <GitlabIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
    default:
      return <GitAltIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
  }
};
