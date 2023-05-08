import React from 'react';
import { useTranslation } from 'react-i18next';

import { history, resourcePath } from '@console/internal/components/hooks';
import { useK8sWatchResource } from '@console/internal/components/hooks/k8s-watch-hook';
import { JobModel, PodModel } from '@console/internal/models';
import { JobKind, PodKind } from '@console/internal/module/k8s';
import { isModifiedEvent } from '@console/shared';
import { Button, Tooltip } from '@patternfly/react-core';

import { EXPORT_JOB_PREFIX } from '../../const';

interface ExportViewLogButtonProps {
  name: string;
  namespace: string;
  onViewLog?: () => void;
}

const ExportViewLogButton: React.FC<ExportViewLogButtonProps> = ({
  name,
  namespace,
  onViewLog,
}) => {
  const { t } = useTranslation();
  const [job, jobLoaded] = useK8sWatchResource<JobKind>({
    kind: JobModel.kind,
    name: EXPORT_JOB_PREFIX + name,
    namespace,
    isList: false,
  });

  const podResource = React.useMemo(
    () =>
      jobLoaded && job?.metadata
        ? {
            kind: PodModel.kind,
            isList: false,
            namespace: job.metadata.namespace,
            selector: job.spec.selector,
          }
        : null,
    [job, jobLoaded],
  );

  const [podData, podLoaded] = useK8sWatchResource<PodKind>(podResource);

  const path =
    podLoaded &&
    podData?.kind === PodModel?.kind &&
    podData?.metadata &&
    `${resourcePath(PodModel.kind, podData?.metadata.name, podData?.metadata.namespace)}/logs`;

  const viewLog = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isModifiedEvent(e)) {
      return;
    }
    e.preventDefault();
    history.push(path);
    onViewLog?.();
  };

  const linkedButton = (
    <Button
      component="a"
      variant="link"
      data-test="export-view-log-btn"
      href={path}
      onClick={viewLog}
    >
      {t('kubevirt-plugin~View Logs')}
    </Button>
  );
  const disabledButton = (
    <Tooltip content={t('kubevirt-plugin~Logs not available yet')}>
      <Button component="a" variant="link" data-test="export-view-log-btn" isAriaDisabled>
        {t('kubevirt-plugin~View Logs')}
      </Button>
    </Tooltip>
  );

  return path ? linkedButton : disabledButton;
};

export default ExportViewLogButton;
