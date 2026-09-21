import type { FC } from 'react';
import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';

type DeleteModalMultipleClusterNamesProps = {
  extraClusters: string[];
  firstClusterName: string;
  hasMultipleClusters: boolean;
};

const DeleteModalMultipleClusterNames: FC<DeleteModalMultipleClusterNamesProps> = ({
  extraClusters,
  firstClusterName,
  hasMultipleClusters,
}) => {
  const { t } = useKubevirtTranslation();

  if (!hasMultipleClusters) return <strong>{firstClusterName}</strong>;

  return (
    <>
      <strong>{firstClusterName}</strong>
      {' + '}
      <strong>{extraClusters.length}</strong>{' '}
      <Popover
        bodyContent={
          <div>
            {extraClusters.map((cluster) => (
              <div key={cluster}>{cluster}</div>
            ))}
          </div>
        }
      >
        <span className="delete-all-vms__more-projects">{t('more projects')}</span>
      </Popover>
    </>
  );
};

export default DeleteModalMultipleClusterNames;
