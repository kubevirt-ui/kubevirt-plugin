import React, { FC } from 'react';
import { Link } from 'react-router';
import { isEmpty } from 'lodash';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Selector as SelectorKind } from '@openshift-console/dynamic-plugin-sdk';
import { SearchIcon } from '@patternfly/react-icons';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { getSelectorSearchURL, selectorToString } from './utils';

type RequirementProps = {
  cluster?: string;
  kind: string;
  namespace?: string;
  requirements: SelectorKind;
};

type SelectorProps = {
  cluster?: string;
  kind?: string;
  namespace?: string;
  selector: SelectorKind;
};

const Requirement: FC<RequirementProps> = ({ cluster, kind, namespace = '', requirements }) => {
  const isACMPage = useIsACMPage({ activePerspectiveSync: false });
  const [hubClusterName] = useHubClusterName();
  // Strip off any trailing '=' characters for valueless selectors
  const requirementAsString = selectorToString(requirements).replace(/=,/g, ',').replace(/=$/g, '');

  const to = getSelectorSearchURL(
    requirementAsString,
    kind,
    namespace,
    isACMPage,
    cluster,
    hubClusterName,
  );

  return (
    <div className="co-m-requirement">
      <Link className={`co-m-requirement__link co-text-${kind.toLowerCase()}`} to={to}>
        <SearchIcon className="co-m-requirement__icon co-icon-flex-child" />
        <span className="co-m-requirement__label">{requirementAsString.replace(/,/g, ', ')}</span>
      </Link>
    </div>
  );
};

export const Selector: FC<SelectorProps> = ({
  cluster = undefined,
  kind = 'Pod',
  namespace = undefined,
  selector = {},
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="co-m-selector">
      {isEmpty(selector) ? (
        <p className="pf-v6-u-text-color-subtle">{t('No selector')}</p>
      ) : (
        <Requirement cluster={cluster} kind={kind} namespace={namespace} requirements={selector} />
      )}
    </div>
  );
};
