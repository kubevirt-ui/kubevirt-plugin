import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import * as _ from 'lodash-es';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Selector as SelectorKind } from '@openshift-console/dynamic-plugin-sdk';
import { SearchIcon } from '@patternfly/react-icons';

import { selectorToString } from './utils';

type RequirementProps = {
  kind: string;
  namespace?: string;
  requirements: SelectorKind;
};

type SelectorProps = {
  kind?: string;
  namespace?: string;
  selector: SelectorKind;
};

const Requirement: React.FC<RequirementProps> = ({ kind, namespace = '', requirements }) => {
  // Strip off any trailing '=' characters for valueless selectors
  const requirementAsString = selectorToString(requirements).replace(/=,/g, ',').replace(/=$/g, '');
  const requirementAsUrlEncodedString = encodeURIComponent(requirementAsString);

  const to = namespace
    ? `/search/ns/${namespace}?kind=${kind}&q=${requirementAsUrlEncodedString}`
    : `/search/all-namespaces?kind=${kind}&q=${requirementAsUrlEncodedString}`;

  return (
    <div className="co-m-requirement">
      <Link className={`co-m-requirement__link co-text-${kind.toLowerCase()}`} to={to}>
        <SearchIcon className="co-m-requirement__icon co-icon-flex-child" />
        <span className="co-m-requirement__label">{requirementAsString.replace(/,/g, ', ')}</span>
      </Link>
    </div>
  );
};

export const Selector: React.FC<SelectorProps> = ({
  kind = 'Pod',
  namespace = undefined,
  selector = {},
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="co-m-selector">
      {_.isEmpty(selector) ? (
        <p className="pf-v6-u-text-color-subtle">{t('No selector')}</p>
      ) : (
        <Requirement kind={kind} namespace={namespace} requirements={selector} />
      )}
    </div>
  );
};
