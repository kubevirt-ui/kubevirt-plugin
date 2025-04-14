import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { Label as PfLabel } from '@patternfly/react-core/dist/esm/components/Label/Label';

export type LabelProps = {
  expand: boolean;
  kind: K8sGroupVersionKind;
  name: string;
  value: string;
};

const Label: FC<LabelProps> = ({ expand, kind, name, value }) => {
  const href = `/search?kind=${kind}&q=${value ? encodeURIComponent(`${name}=${value}`) : name}`;

  return (
    <>
      <PfLabel className={classNames({ 'co-m-expand': expand }, 'co-label')}>
        <Link className="pf-v5-c-label__content" to={href}>
          <span className="co-label__key" data-test="label-key">
            {name}
          </span>
          {value && <span className="co-label__eq">=</span>}
          {value && <span className="co-label__value">{value}</span>}
        </Link>
      </PfLabel>
    </>
  );
};

export default Label;
