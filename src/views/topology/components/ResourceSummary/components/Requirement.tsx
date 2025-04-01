import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { Selector } from '@openshift-console/dynamic-plugin-sdk';
import { selectorToString } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';
import { SearchIcon } from '@patternfly/react-icons';

type RequirementProps = {
  kind: string;
  namespace?: string;
  requirements: Selector;
};

const Requirement: FC<RequirementProps> = ({ kind, namespace = '', requirements }) => {
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

export default Requirement;
