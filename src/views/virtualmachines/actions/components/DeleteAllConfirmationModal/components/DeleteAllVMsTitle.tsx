import React, { type FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import DeleteModalMultipleClusterNames from './DeleteModalMultipleClusterNames';
import DeleteModalMultipleProjectNames from './DeleteModalMultipleProjectNames';

export type DeleteAllVmsTitleProps = {
  clusters: string[];
  hasMultipleClusters: boolean;
  hasMultipleNamespaces: boolean;
  namespaces: string[];
  numVMs: number;
};

export const DeleteAllVMsTitle: FC<DeleteAllVmsTitleProps> = ({
  clusters,
  hasMultipleClusters,
  hasMultipleNamespaces,
  namespaces,
  numVMs,
}) => {
  const { t } = useKubevirtTranslation();

  const firstProjectName = namespaces[0];
  const extraNamespaces = namespaces.slice(1);
  const hasClusters = clusters.length > 0;
  const firstClusterName = clusters[0];
  const extraClusters = clusters.slice(1);

  const projectDisplay = (
    <DeleteModalMultipleProjectNames
      extraNamespaces={extraNamespaces}
      firstProjectName={firstProjectName}
      hasMultipleNamespaces={hasMultipleNamespaces}
    />
  );

  const clusterDisplay = (
    <DeleteModalMultipleClusterNames
      extraClusters={extraClusters}
      firstClusterName={firstClusterName}
      hasMultipleClusters={hasMultipleClusters}
    />
  );

  if (hasClusters) {
    return (
      <Trans ns="plugin__kubevirt-plugin" t={t}>
        Are you sure you want to delete <strong>{{ numVMs }} VirtualMachines</strong> <br /> in
        project {projectDisplay}, cluster {clusterDisplay}. All the selected VMs and their
        associated data will be lost.
      </Trans>
    );
  }

  return (
    <Trans ns="plugin__kubevirt-plugin" t={t}>
      Are you sure you want to delete <strong>{{ numVMs }} VirtualMachines</strong> <br /> in
      project {projectDisplay}. All the selected VMs and their associated data will be lost.
    </Trans>
  );
};
