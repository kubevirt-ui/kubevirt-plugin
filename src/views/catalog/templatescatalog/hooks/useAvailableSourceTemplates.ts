import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { BOOT_SOURCE, useVmTemplates } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
  getTemplateBootSourceType,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

export const useAvailableSourceTemplates = (
  showOnlyAvailable = false,
): useAvailableSourceTemplatesValues => {
  const { templates, loaded } = useVmTemplates();

  const [templatesWithSource, setTemplatesWithSource] = React.useState<{
    [uid: string]: V1Template;
  }>({});
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
      showOnlyAvailable &&
      templates
        .filter((template) => {
          const bootSource = getTemplateBootSourceType(template);
          return (
            bootSource?.type === BOOT_SOURCE.PVC || bootSource?.type === BOOT_SOURCE.PVC_AUTO_UPLOAD
          );
        })
        .map((template) => {
          const bootSource = getTemplateBootSourceType(template);

          if (bootSource.type === BOOT_SOURCE.PVC) {
            const pvc = bootSource.source.pvc;
            return getPVC(pvc.name, pvc.namespace).then(() => template);
          }
          const dataSource = bootSource.source.sourceRef;
          return getDataSource(dataSource.name, dataSource.namespace).then((sourceRef) => {
            if (
              sourceRef?.status?.conditions?.find((c) => c.type === 'Ready' && c.status === 'True')
            ) {
              return template;
            }
          });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showOnlyAvailable, templates],
  );

  React.useEffect(() => {
    if (showOnlyAvailable) {
      promises.reduce((acc, promise) => {
        return acc
          .then(() => promise)
          .then((template) => {
            if (template) {
              setTemplatesWithSource((prev) => ({ ...prev, [template.metadata.uid]: template }));
            }
          })
          .catch((err) => {
            setError(err);
          });
      }, Promise.resolve());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promises]);

  return {
    templates: showOnlyAvailable
      ? [...initialAvailableTemplates, ...Object.values(templatesWithSource)]
      : templates,
    loaded,
    initialSourcesLoaded: !error && Object.keys(templatesWithSource).length > 0,
    error,
  };
};

type useAvailableSourceTemplatesValues = {
  templates: V1Template[];
  loaded: boolean;
  initialSourcesLoaded: boolean;
  error: any;
};
