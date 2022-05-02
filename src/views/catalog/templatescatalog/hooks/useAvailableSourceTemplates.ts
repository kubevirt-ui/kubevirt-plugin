import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  BOOT_SOURCE,
  isDefaultVariantTemplate,
  useVmTemplates,
} from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
  getTemplateBootSourceType,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

type useAvailableSourceTemplatesProps = {
  onlyAvailable: boolean;
  onlyDefault: boolean;
  namespace?: string;
};

export const useAvailableSourceTemplates = ({
  onlyAvailable,
  onlyDefault,
  namespace,
}: useAvailableSourceTemplatesProps): useAvailableSourceTemplatesValues => {
  const { templates, loaded, loadError } = useVmTemplates(namespace);

  const [templatesWithSource, setTemplatesWithSource] = React.useState<{
    [uid: string]: V1Template;
  }>({});
  const [templatesWithSourceLoaded, setTemplatesWithSourceLoaded] = React.useState(false);
  const [error, setError] = React.useState<any>();

  const promises = React.useMemo(
    () =>
      loaded &&
      templates
        .filter((template) => (onlyDefault ? isDefaultVariantTemplate(template) : true))
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
    [loaded, templates, onlyDefault],
  );

  const initialAvailableTemplates = React.useMemo(
    () =>
      loaded &&
      templates.filter((t) => {
        const bootSource = getTemplateBootSourceType(t);
        return bootSource?.type === BOOT_SOURCE.REGISTRY || bootSource?.type === BOOT_SOURCE.URL;
      }),
    [templates, loaded],
  );

  const availableTemplates = React.useMemo(
    () => [...(initialAvailableTemplates || []), ...Object.values(templatesWithSource)],
    [initialAvailableTemplates, templatesWithSource],
  );

  React.useEffect(() => {
    if (Array.isArray(promises)) {
      Promise.allSettled(promises)
        .then(() => setTemplatesWithSourceLoaded(true))
        .catch(setError);
    }
  }, [promises]);

  return {
    templates: onlyAvailable ? availableTemplates : templates,
    availableTemplatesUID: new Set(availableTemplates.map((t) => t.metadata.uid)),
    initialSourcesLoaded: templatesWithSourceLoaded || Object.keys(templatesWithSource).length > 0,
    loaded,
    error: error || loadError,
  };
};

type useAvailableSourceTemplatesValues = {
  templates: V1Template[];
  availableTemplatesUID: Set<string>;
  loaded: boolean;
  initialSourcesLoaded: boolean;
  error: any;
};
