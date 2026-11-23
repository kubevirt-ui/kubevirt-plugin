import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';

type DeleteModalMultipleProjectNamesProps = {
  extraNamespaces: string[];
  firstProjectName: string;
  hasMultipleNamespaces: boolean;
};

const DeleteModalMultipleProjectNames: FC<DeleteModalMultipleProjectNamesProps> = ({
  extraNamespaces,
  firstProjectName,
  hasMultipleNamespaces,
}) => {
  const { t } = useKubevirtTranslation();

  if (!hasMultipleNamespaces) return <strong>{firstProjectName}</strong>;

  return (
    <>
      <strong>{firstProjectName}</strong>
      {' + '}
      <strong>{extraNamespaces.length}</strong>{' '}
      <Popover
        bodyContent={
          <div>
            {extraNamespaces.map((namespace) => (
              <div key={namespace}>{namespace}</div>
            ))}
          </div>
        }
      >
        <span className="delete-all-vms__more-projects">{t('more projects')}</span>
      </Popover>
    </>
  );
};

export default DeleteModalMultipleProjectNames;
