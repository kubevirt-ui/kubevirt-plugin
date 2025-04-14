import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector as SelectorType } from '@openshift-console/dynamic-plugin-sdk';

import Requirement from './Requirement';

type SelectorProps = {
  kind?: string;
  namespace?: string;
  selector: SelectorType;
};

const Selector: FC<SelectorProps> = ({ kind = 'Pod', namespace = undefined, selector = {} }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-m-selector">
      {isEmpty(selector) ? (
        <p className="text-muted">{t('No selector')}</p>
      ) : (
        <Requirement kind={kind} namespace={namespace} requirements={selector} />
      )}
    </div>
  );
};

export default Selector;
