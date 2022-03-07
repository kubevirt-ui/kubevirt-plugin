import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { BOOT_SOURCE, useVmTemplates } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
  getTemplateBootSourceType,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

export const useVmTemplatesWithAvailableSource = (
  showOnlyAvailable = false,
): useVmTemplatesWithAvailableSourceValues => {
  const { templates, loaded } = useVmTemplates();

  const [templatesWithSource, setTemplatesWithSource] = React.useState<V1Template[]>([]);
  const [templatesWithSourceLoaded, setTemplatesWithSourceLoaded] = React.useState<boolean>(true);
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
      templatesWithSource.length === 0 &&
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
          return getDataSource(dataSource.name, dataSource.namespace).then((sourceRef: any) => {
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
    if (showOnlyAvailable && templatesWithSource.length === 0) {
      setTemplatesWithSourceLoaded(false);

      Promise.allSettled<V1Template>(promises)
        .then((results) => {
          const availableTemplates = results
            .filter((result) => result.status === 'fulfilled' && result.value)
            .map((result) => result.status === 'fulfilled' && result.value);

          setTemplatesWithSource(availableTemplates);
          setTemplatesWithSourceLoaded(true);
        })
        .catch(setError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promises]);

  return {
    templates: showOnlyAvailable
      ? [...initialAvailableTemplates, ...templatesWithSource]
      : templates,
    loaded,
    templatesWithSourceLoaded,
    error,
  };
};

type useVmTemplatesWithAvailableSourceValues = {
  templates: V1Template[];
  loaded: boolean;
  templatesWithSourceLoaded: boolean;
  error: any;
};
