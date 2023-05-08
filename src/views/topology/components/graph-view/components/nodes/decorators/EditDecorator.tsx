import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ConsoleLinkModel, modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Node } from '@patternfly/react-topology';

import { K8sResourceKind } from '../../../../../../clusteroverview/utils/types';
import { getCheDecoratorData, getEditURL } from '../../../../../utils';
import { routeDecoratorIcon } from '../../router-decorator-icon/route-decorator-icon';

import Decorator from './Decorator';

interface DefaultDecoratorProps {
  element: Node;
  radius: number;
  x: number;
  y: number;
}

const EditDecorator: FC<DefaultDecoratorProps> = ({ element, radius, x, y }) => {
  const { t } = useTranslation();
  const [consoleLinks] = useK8sWatchResource<K8sResourceKind[]>({
    isList: true,
    kind: modelToRef(ConsoleLinkModel),
    optional: true,
  });
  const { cheURL, cheIconURL } = getCheDecoratorData(consoleLinks);
  const workloadData = element.getData().data;
  const { editURL, vcsURI, vcsRef } = workloadData;
  const cheEnabled = !!cheURL;
  const editUrl = editURL || getEditURL(vcsURI, vcsRef, cheURL);
  const repoIcon = routeDecoratorIcon(editUrl, radius, t, cheEnabled, cheIconURL);

  if (!repoIcon) {
    return null;
  }
  const label = t('kubevirt-plugin~Edit source code');
  return (
    <Tooltip content={label} position={TooltipPosition.right}>
      <Decorator x={x} y={y} radius={radius} href={editUrl} external ariaLabel={label}>
        <g transform={`translate(-${radius / 2}, -${radius / 2})`}>{repoIcon}</g>
      </Decorator>
    </Tooltip>
  );
};

export default EditDecorator;
