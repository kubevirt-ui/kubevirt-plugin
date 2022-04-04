import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { BOOT_SOURCE, useVmTemplates } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
  getTemplateBootSourceType,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

type useAvailableSourceTemplatesProps = {
  onlyAvailable: boolean;
  namespace: string;
};

export const useAvailableSourceTemplates = ({
  onlyAvailable,
  namespace,
}: useAvailableSourceTemplatesProps): useAvailableSourceTemplatesValues => {
  const { templates, loaded, loadError } = useVmTemplates(namespace);

  const [templatesWithSource, setTemplatesWithSource] = React.useState<{
    [uid: string]: V1Template;
  }>({});
  const [templatesWithSourceLoaded, setTemplatesWithSourceLoaded] = React.useState(false);
  const [error, setError] = React.useState<any>();

  const initialAvailableTemplates = React.useMemo(
    () =>
      templates.filter((t) => {
        const bootSource = getTemplateBootSourceType(t);
        return bootSource?.type === BOOT_SOURCE.REGISTRY || bootSource?.type === BOOT_SOURCE.URL;
      }),
    [templates],
  );

  const promises = React.useMemo(
    () =>
      onlyAvailable &&
      templates
        .filter((template) => {
          const bootSource = getTemplateBootSourceType(template);
          return (
            bootSource?.type === BOOT_SOURCE.PVC || bootSource?.type === BOOT_SOURCE.PVC_AUTO_UPLOAD
          );
        })
        .map((template) => {
          const bootSource = getTemplateBootSourceType(template);

          // pvc
          if (bootSource.type === BOOT_SOURCE.PVC) {
            const pvc = bootSource.source.pvc;
            return getPVC(pvc.name, pvc.namespace).then(() =>
              setTemplatesWithSource((prev) => ({ ...prev, [template.metadata.uid]: template })),
            );
          }
          // data source
          const dataSource = bootSource.source.sourceRef;
          return getDataSource(dataSource.name, dataSource.namespace).then((sourceRef) => {
            if (
              sourceRef?.status?.conditions?.find((c) => c.type === 'Ready' && c.status === 'True')
            ) {
              setTemplatesWithSource((prev) => ({ ...prev, [template.metadata.uid]: template }));
            }
          });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onlyAvailable, templates],
  );

  const templatesToRender = React.useMemo(
    () =>
      onlyAvailable
        ? [...initialAvailableTemplates, ...Object.values(templatesWithSource)]
        : templates,
    [onlyAvailable, initialAvailableTemplates, templatesWithSource, templates],
  );

  React.useEffect(() => {
    if (onlyAvailable) {
      Promise.allSettled(promises)
        .then(() => setTemplatesWithSourceLoaded(true))
        .catch(setError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promises]);

  return {
    templates: templatesToRender,
    loaded,
    initialSourcesLoaded: templatesWithSourceLoaded || Object.keys(templatesWithSource).length > 0,
    error: error || loadError,
  };
};

type useAvailableSourceTemplatesValues = {
  templates: V1Template[];
  loaded: boolean;
  initialSourcesLoaded: boolean;
  error: any;
};
